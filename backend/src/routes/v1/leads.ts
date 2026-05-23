import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';
import { requireAuth, requireRole } from './auth.js';

const leadIngestSchema = z.object({
  vertical_slug: z.string(),
  country_code: z.string().length(2),
  fields: z.record(z.any()),
  consent_text_shown: z.string().min(1),
  consent_given: z.boolean().refine(v => v === true, { message: 'Consent is required' }),
});

export function leadRoutes(db: Knex): Router {
  const router = Router();

  // Public: ingest lead from web form
  router.post('/leads/ingest', async (req, res, next) => {
    try {
      const data = leadIngestSchema.parse(req.body);

      const vertical = await db('verticals').where('slug', data.vertical_slug).first();
      if (!vertical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical not found' } });

      const country = await db('countries').where('code', data.country_code).first();
      if (!country) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Country not found' } });

      const vc = await db('vertical_countries')
        .where({ vertical_id: vertical.id, country_id: country.id, status: 'active' })
        .first();
      if (!vc) return res.status(400).json({ success: false, error: { code: 'NOT_ACTIVE', message: 'This vertical is not active in this country' } });

      // Validate form fields against vertical config
      const formFields = vc.form_fields_override || vertical.form_fields;
      const requiredFields = (typeof formFields === 'string' ? JSON.parse(formFields) : formFields)
        .filter((f: any) => f.required)
        .map((f: any) => f.name);

      for (const field of requiredFields) {
        if (!data.fields[field]) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: `Field "${field}" is required` } });
        }
      }

      const [lead] = await db('leads')
        .insert({
          vertical_id: vertical.id,
          country_id: country.id,
          custom_fields: JSON.stringify(data.fields),
          consent_method: 'web_form',
          consent_timestamp: new Date(),
          consent_text_shown: data.consent_text_shown,
          source: 'web',
          ip_address: req.ip,
          user_agent: req.headers['user-agent']?.slice(0, 500),
          status: 'new',
        })
        .returning('id');

      res.status(201).json({ success: true, data: { lead_id: lead.id, message: 'Thank you for your submission.' } });
    } catch (error) {
      next(error);
    }
  });

  // Subscriber: list leads in subscribed verticals/countries
  router.get('/leads', requireAuth, async (req: any, res, next) => {
    try {
      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) return res.json({ success: true, data: { leads: [], total: 0 } });

      // Get subscribed vertical+country combos
      const subs = await db('subscriptions')
        .where({ subscriber_id: subscriber.id, status: 'active' })
        .select('vertical_id', 'country_id');

      if (subs.length === 0) return res.json({ success: true, data: { leads: [], total: 0 } });

      const { page = 1, limit = 50, status, q, vertical_id, country_id } = req.query;

      let query = db('leads')
        .whereNull('leads.deleted_at')
        .where(function () {
          for (const sub of subs) {
            this.orWhere(function () {
              this.where('leads.vertical_id', sub.vertical_id).andWhere('leads.country_id', sub.country_id);
            });
          }
        });

      if (status) query = query.where('leads.status', status as string);
      if (vertical_id) query = query.where('leads.vertical_id', Number(vertical_id));
      if (country_id) query = query.where('leads.country_id', Number(country_id));
      if (q) {
        const search = `%${q}%`;
        query = query.whereRaw("leads.custom_fields::text ILIKE ?", [search]);
      }

      const countQuery = query.clone().count('* as count');
      const offset = (Number(page) - 1) * Number(limit);

      const leads = await query
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .join('countries', 'leads.country_id', 'countries.id')
        .select(
          'leads.*',
          'verticals.name as vertical_name', 'verticals.slug as vertical_slug',
          'countries.name as country_name', 'countries.code as country_code', 'countries.flag_emoji',
        )
        .orderBy('leads.created_at', 'desc')
        .limit(Number(limit))
        .offset(offset);

      const [{ count }] = await countQuery;

      // Get subscriber-specific status for each lead
      const leadIds = leads.map((l: any) => l.id);
      const statuses = leadIds.length > 0
        ? await db('lead_subscriber_status')
            .where('subscriber_id', subscriber.id)
            .whereIn('lead_id', leadIds)
        : [];
      const statusMap: Record<number, any> = {};
      for (const s of statuses) statusMap[s.lead_id] = s;

      const enriched = leads.map((l: any) => ({
        ...l,
        subscriber_status: statusMap[l.id] || null,
      }));

      res.json({ success: true, data: { leads: enriched, total: Number(count), page: Number(page), limit: Number(limit) } });
    } catch (error) {
      next(error);
    }
  });

  // Subscriber: update status on a lead
  router.patch('/leads/:id/status', requireAuth, async (req: any, res, next) => {
    try {
      const { status } = z.object({
        status: z.enum(['new', 'contacted', 'converted', 'rejected']),
      }).parse(req.body);

      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a subscriber' } });

      await db('lead_subscriber_status')
        .insert({
          lead_id: Number(req.params.id),
          subscriber_id: subscriber.id,
          status,
          contacted_at: status === 'contacted' ? new Date() : null,
        })
        .onConflict(['lead_id', 'subscriber_id'])
        .merge({ status, contacted_at: status === 'contacted' ? new Date() : undefined });

      res.json({ success: true, data: { message: 'Status updated' } });
    } catch (error) {
      next(error);
    }
  });

  // Subscriber: add notes on a lead
  router.post('/leads/:id/notes', requireAuth, async (req: any, res, next) => {
    try {
      const { notes } = z.object({ notes: z.string().max(5000) }).parse(req.body);

      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a subscriber' } });

      await db('lead_subscriber_status')
        .insert({ lead_id: Number(req.params.id), subscriber_id: subscriber.id, notes, status: 'new' })
        .onConflict(['lead_id', 'subscriber_id'])
        .merge({ notes });

      res.json({ success: true, data: { message: 'Notes saved' } });
    } catch (error) {
      next(error);
    }
  });

  // Subscriber: export leads as CSV
  router.get('/leads/export', requireAuth, async (req: any, res, next) => {
    try {
      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a subscriber' } });

      const subs = await db('subscriptions')
        .where({ subscriber_id: subscriber.id, status: 'active' })
        .select('vertical_id', 'country_id');

      if (subs.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
        return res.send('No active subscriptions');
      }

      const leads = await db('leads')
        .whereNull('deleted_at')
        .where(function () {
          for (const sub of subs) {
            this.orWhere(function () {
              this.where('vertical_id', sub.vertical_id).andWhere('country_id', sub.country_id);
            });
          }
        })
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .join('countries', 'leads.country_id', 'countries.id')
        .select('leads.id', 'leads.custom_fields', 'leads.status', 'leads.source', 'leads.created_at',
          'verticals.name as vertical', 'countries.name as country');

      const rows = leads.map((l: any) => {
        const fields = typeof l.custom_fields === 'string' ? JSON.parse(l.custom_fields) : l.custom_fields;
        return {
          id: l.id,
          vertical: l.vertical,
          country: l.country,
          status: l.status,
          source: l.source,
          ...fields,
          created_at: l.created_at,
        };
      });

      if (rows.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
        return res.send('No leads found');
      }

      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map((r: any) => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  });

  // API: ingest leads with API key
  router.post('/api/v1/leads', async (req, res, next) => {
    try {
      const data = leadIngestSchema.parse(req.body);
      const vertical = await db('verticals').where('slug', data.vertical_slug).first();
      const country = await db('countries').where('code', data.country_code).first();
      if (!vertical || !country) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical or country not found' } });

      const [lead] = await db('leads')
        .insert({
          vertical_id: vertical.id,
          country_id: country.id,
          custom_fields: JSON.stringify(data.fields),
          consent_method: 'web_form',
          consent_timestamp: new Date(),
          consent_text_shown: data.consent_text_shown,
          source: 'api',
          ip_address: req.ip,
          status: 'new',
        })
        .returning('id');

      res.status(201).json({ success: true, data: { lead_id: lead.id } });
    } catch (error) {
      next(error);
    }
  });

  // API: bulk import
  router.post('/api/v1/leads/bulk', requireAuth, requireRole('admin'), async (req: any, res, next) => {
    try {
      const { leads: leadsData } = z.object({
        leads: z.array(leadIngestSchema).max(1000),
      }).parse(req.body);

      const results = [];
      for (const item of leadsData) {
        const vertical = await db('verticals').where('slug', item.vertical_slug).first();
        const country = await db('countries').where('code', item.country_code).first();
        if (!vertical || !country) { results.push({ error: 'Vertical or country not found' }); continue; }

        const [lead] = await db('leads')
          .insert({
            vertical_id: vertical.id,
            country_id: country.id,
            custom_fields: JSON.stringify(item.fields),
            consent_method: 'web_form',
            consent_timestamp: new Date(),
            consent_text_shown: item.consent_text_shown,
            source: 'api',
            ip_address: req.ip,
            status: 'new',
          })
          .returning('id');
        results.push({ lead_id: lead.id });
      }

      res.status(201).json({ success: true, data: { results, total: results.length } });
    } catch (error) {
      next(error);
    }
  });

  // API: CSV import
  router.post('/api/v1/leads/import-csv', requireAuth, requireRole('admin'), async (req: any, res, next) => {
    try {
      // Expects JSON with csv_data field containing parsed CSV rows
      const { rows, vertical_slug, country_code, consent_text } = z.object({
        rows: z.array(z.record(z.string())),
        vertical_slug: z.string(),
        country_code: z.string().length(2),
        consent_text: z.string(),
      }).parse(req.body);

      const vertical = await db('verticals').where('slug', vertical_slug).first();
      const country = await db('countries').where('code', country_code).first();
      if (!vertical || !country) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical or country not found' } });

      let imported = 0;
      for (const row of rows) {
        await db('leads').insert({
          vertical_id: vertical.id,
          country_id: country.id,
          custom_fields: JSON.stringify(row),
          consent_method: 'web_form',
          consent_timestamp: new Date(),
          consent_text_shown: consent_text,
          source: 'csv',
          status: 'new',
        });
        imported++;
      }

      res.status(201).json({ success: true, data: { imported } });
    } catch (error) {
      next(error);
    }
  });

  // Subscriber: reveal lead contact info (paywall)
  router.post('/leads/:id/reveal', requireAuth, async (req: any, res, next) => {
    try {
      const leadId = Number(req.params.id);
      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a subscriber' } });
      }

      const lead = await db('leads').where('id', leadId).whereNull('deleted_at').first();
      if (!lead) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
      }

      // Check if subscriber has an active subscription for this vertical+country
      const subscription = await db('subscriptions')
        .where({
          subscriber_id: subscriber.id,
          vertical_id: lead.vertical_id,
          country_id: lead.country_id,
          status: 'active',
        })
        .first();

      if (!subscription) {
        // Return pricing info so frontend can show upgrade modal
        const vc = await db('vertical_countries')
          .join('verticals', 'vertical_countries.vertical_id', 'verticals.id')
          .join('countries', 'vertical_countries.country_id', 'countries.id')
          .where({
            'vertical_countries.vertical_id': lead.vertical_id,
            'vertical_countries.country_id': lead.country_id,
          })
          .select(
            'verticals.name as vertical_name', 'verticals.slug as vertical_slug',
            'countries.name as country_name', 'countries.code as country_code',
            'vertical_countries.price', 'vertical_countries.currency_code',
          )
          .first();

        return res.status(402).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_REQUIRED',
            message: 'Active subscription required to reveal contact information',
            pricing: vc || null,
          },
        });
      }

      // Log the access
      await db('lead_access_log').insert({
        lead_id: leadId,
        subscriber_id: subscriber.id,
        access_type: 'reveal',
        ip_address: req.ip,
      });

      // Return the full contact info
      const fields = typeof lead.custom_fields === 'string'
        ? JSON.parse(lead.custom_fields)
        : lead.custom_fields;

      res.json({
        success: true,
        data: {
          lead_id: leadId,
          email: fields.email || null,
          phone: fields.phone || null,
          full_name: fields.full_name || null,
          all_fields: fields,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Subscriber: send message to lead through platform
  router.post('/leads/:id/contact', requireAuth, async (req: any, res, next) => {
    try {
      const leadId = Number(req.params.id);
      const { subject, message } = z.object({
        subject: z.string().min(1).max(255),
        message: z.string().min(1).max(5000),
      }).parse(req.body);

      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not a subscriber' } });
      }

      const lead = await db('leads').where('id', leadId).whereNull('deleted_at').first();
      if (!lead) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
      }

      // Check subscription
      const subscription = await db('subscriptions')
        .where({
          subscriber_id: subscriber.id,
          vertical_id: lead.vertical_id,
          country_id: lead.country_id,
          status: 'active',
        })
        .first();

      if (!subscription) {
        return res.status(402).json({
          success: false,
          error: { code: 'SUBSCRIPTION_REQUIRED', message: 'Active subscription required to contact leads' },
        });
      }

      // Log the contact attempt
      await db('lead_access_log').insert({
        lead_id: leadId,
        subscriber_id: subscriber.id,
        access_type: 'contact',
        ip_address: req.ip,
      });

      // In production, this would send an email via a mail service.
      // For now, we log the intent and return success.
      const fields = typeof lead.custom_fields === 'string'
        ? JSON.parse(lead.custom_fields)
        : lead.custom_fields;

      const recipientEmail = fields.email;

      // TODO: Integrate with email service (SendGrid, SES, etc.)
      // await mailService.send({
      //   to: recipientEmail,
      //   from: 'noreply@leadova.com',
      //   subject,
      //   body: message,
      //   replyTo: subscriberEmail,
      // });

      res.json({
        success: true,
        data: {
          message: 'Message queued for delivery',
          lead_id: leadId,
          recipient_email: recipientEmail ? recipientEmail.replace(/(.{2}).*(@.*)/, '$1***$2') : null,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
