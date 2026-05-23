import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';
import { requireAuth, requireRole } from './auth.js';

export function adminRoutes(db: Knex): Router {
  const router = Router();
  const auth = [requireAuth, requireRole('admin')];

  // Analytics
  router.get('/admin/analytics', ...auth, async (_req: any, res, next) => {
    try {
      const [{ total_leads }] = await db('leads').whereNull('deleted_at').count('* as total_leads');
      const [{ total_subscribers }] = await db('subscribers').count('* as total_subscribers');
      const [{ total_agents }] = await db('agents').count('* as total_agents');
      const [{ active_subscriptions }] = await db('subscriptions').where('status', 'active').count('* as active_subscriptions');
      const [{ waitlist_count }] = await db('waitlist').count('* as waitlist_count');

      const leadsByVertical = await db('leads')
        .whereNull('deleted_at')
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .groupBy('verticals.name')
        .select('verticals.name')
        .count('* as count')
        .orderBy('count', 'desc');

      const leadsByCountry = await db('leads')
        .whereNull('deleted_at')
        .join('countries', 'leads.country_id', 'countries.id')
        .groupBy('countries.name', 'countries.flag_emoji')
        .select('countries.name', 'countries.flag_emoji')
        .count('* as count')
        .orderBy('count', 'desc');

      const recentLeads = await db('leads')
        .whereNull('deleted_at')
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .join('countries', 'leads.country_id', 'countries.id')
        .select('leads.id', 'leads.custom_fields', 'leads.status', 'leads.source', 'leads.created_at',
          'verticals.name as vertical_name', 'countries.name as country_name', 'countries.flag_emoji')
        .orderBy('leads.created_at', 'desc')
        .limit(20);

      res.json({
        success: true,
        data: {
          analytics: {
            total_leads: Number(total_leads),
            total_subscribers: Number(total_subscribers),
            total_agents: Number(total_agents),
            active_subscriptions: Number(active_subscriptions),
            waitlist_count: Number(waitlist_count),
            leads_by_vertical: leadsByVertical,
            leads_by_country: leadsByCountry,
            recent_leads: recentLeads,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // CRUD: leads
  router.get('/admin/leads', ...auth, async (req: any, res, next) => {
    try {
      const { page = 1, limit = 50, status, vertical_id, country_id } = req.query;
      let query = db('leads').whereNull('leads.deleted_at');
      if (status) query = query.where('leads.status', status as string);
      if (vertical_id) query = query.where('leads.vertical_id', Number(vertical_id));
      if (country_id) query = query.where('leads.country_id', Number(country_id));

      const countQuery = query.clone().count('* as count');
      const leads = await query
        .join('verticals', 'leads.vertical_id', 'verticals.id')
        .join('countries', 'leads.country_id', 'countries.id')
        .select('leads.*', 'verticals.name as vertical_name', 'countries.name as country_name', 'countries.flag_emoji')
        .orderBy('leads.created_at', 'desc')
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      const [{ count }] = await countQuery;
      res.json({ success: true, data: { leads, total: Number(count) } });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/admin/leads/:id', ...auth, async (req: any, res, next) => {
    try {
      await db('leads').where('id', req.params.id).update({ deleted_at: new Date() });
      res.json({ success: true, data: { message: 'Lead soft-deleted' } });
    } catch (error) {
      next(error);
    }
  });

  // CRUD: subscribers
  router.get('/admin/subscribers', ...auth, async (_req: any, res, next) => {
    try {
      const subscribers = await db('subscribers')
        .join('users', 'subscribers.user_id', 'users.id')
        .select('subscribers.*', 'users.email', 'users.name')
        .orderBy('subscribers.created_at', 'desc');
      res.json({ success: true, data: { subscribers } });
    } catch (error) {
      next(error);
    }
  });

  // CRUD: agents
  router.get('/admin/agents', ...auth, async (_req: any, res, next) => {
    try {
      const agents = await db('agents')
        .join('users', 'agents.user_id', 'users.id')
        .select('agents.*', 'users.email', 'users.name')
        .orderBy('agents.created_at', 'desc');
      res.json({ success: true, data: { agents } });
    } catch (error) {
      next(error);
    }
  });

  // CRUD: verticals
  router.get('/admin/verticals', ...auth, async (_req: any, res, next) => {
    try {
      const verticals = await db('verticals').orderBy('name');
      res.json({ success: true, data: { verticals } });
    } catch (error) {
      next(error);
    }
  });

  router.put('/admin/verticals/:id', ...auth, async (req: any, res, next) => {
    try {
      const [vertical] = await db('verticals').where('id', req.params.id).update(req.body).returning('*');
      res.json({ success: true, data: { vertical } });
    } catch (error) {
      next(error);
    }
  });

  // CRUD: countries
  router.get('/admin/countries', ...auth, async (_req: any, res, next) => {
    try {
      const countries = await db('countries').orderBy('name');
      res.json({ success: true, data: { countries } });
    } catch (error) {
      next(error);
    }
  });

  // CRUD: vertical_countries
  router.get('/admin/vertical-countries', ...auth, async (_req: any, res, next) => {
    try {
      const vcs = await db('vertical_countries')
        .join('verticals', 'vertical_countries.vertical_id', 'verticals.id')
        .join('countries', 'vertical_countries.country_id', 'countries.id')
        .select('vertical_countries.*', 'verticals.name as vertical_name', 'countries.name as country_name')
        .orderBy('verticals.name');
      res.json({ success: true, data: { vertical_countries: vcs } });
    } catch (error) {
      next(error);
    }
  });

  router.put('/admin/vertical-countries/:id', ...auth, async (req: any, res, next) => {
    try {
      const [vc] = await db('vertical_countries').where('id', req.params.id).update(req.body).returning('*');
      res.json({ success: true, data: { vertical_country: vc } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
