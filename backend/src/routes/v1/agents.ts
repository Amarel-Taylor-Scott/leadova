import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import type { Knex } from 'knex';
import { requireAuth } from './auth.js';

export function agentRoutes(db: Knex): Router {
  const router = Router();

  // Agent profile
  router.get('/agents/me', requireAuth, async (req: any, res, next) => {
    try {
      const agent = await db('agents').where('user_id', req.session.userId).first();
      if (!agent) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent profile not found' } });

      res.json({ success: true, data: { agent } });
    } catch (error) {
      next(error);
    }
  });

  // Agent: submit lead
  router.post('/agents/submit-lead', requireAuth, async (req: any, res, next) => {
    try {
      const data = z.object({
        vertical_slug: z.string(),
        country_code: z.string().length(2),
        fields: z.record(z.any()),
        consent_method: z.enum(['agent_verbal', 'agent_signature']),
        consent_text_shown: z.string().min(1),
      }).parse(req.body);

      const agent = await db('agents').where('user_id', req.session.userId).first();
      if (!agent) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not an agent' } });

      const vertical = await db('verticals').where('slug', data.vertical_slug).first();
      const country = await db('countries').where('code', data.country_code).first();
      if (!vertical || !country) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical or country not found' } });

      const [lead] = await db('leads')
        .insert({
          vertical_id: vertical.id,
          country_id: country.id,
          custom_fields: JSON.stringify(data.fields),
          consent_method: data.consent_method,
          consent_timestamp: new Date(),
          consent_text_shown: data.consent_text_shown,
          source: 'agent',
          agent_id: req.session.userId,
          ip_address: req.ip,
          status: 'new',
        })
        .returning('id');

      // Update agent stats
      await db('agents').where('id', agent.id).increment('leads_submitted', 1);

      res.status(201).json({ success: true, data: { lead_id: lead.id, message: 'Lead submitted' } });
    } catch (error) {
      next(error);
    }
  });

  // Agent: activity log
  router.get('/agents/log', requireAuth, async (req: any, res, next) => {
    try {
      const leads = await db('leads')
        .where('agent_id', req.session.userId)
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .join('countries', 'leads.country_id', 'countries.id')
        .select(
          'leads.id', 'leads.custom_fields', 'leads.status', 'leads.consent_method', 'leads.created_at',
          'verticals.name as vertical_name',
          'countries.name as country_name', 'countries.flag_emoji',
        )
        .orderBy('leads.created_at', 'desc')
        .limit(100);

      res.json({ success: true, data: { leads } });
    } catch (error) {
      next(error);
    }
  });

  // Agent: stats
  router.get('/agents/stats', requireAuth, async (req: any, res, next) => {
    try {
      const agent = await db('agents').where('user_id', req.session.userId).first();
      if (!agent) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });

      const [{ total }] = await db('leads').where('agent_id', req.session.userId).count('* as total');
      const [{ this_month }] = await db('leads')
        .where('agent_id', req.session.userId)
        .where('created_at', '>=', db.raw("date_trunc('month', NOW())"))
        .count('* as this_month');

      const byVertical = await db('leads')
        .where('agent_id', req.session.userId)
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .groupBy('verticals.name')
        .select('verticals.name')
        .count('* as count');

      res.json({
        success: true,
        data: {
          stats: {
            total_leads: Number(total),
            this_month: Number(this_month),
            commission_rate: agent.commission_rate,
            agent_code: agent.agent_code,
            status: agent.status,
            by_vertical: byVertical,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
