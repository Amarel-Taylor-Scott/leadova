import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';
import { requireAuth } from './auth.js';

export function subscriberRoutes(db: Knex): Router {
  const router = Router();

  // Create subscription for a vertical+country
  router.post('/subscribe', requireAuth, async (req: any, res, next) => {
    try {
      const data = z.object({
        vertical_id: z.number().int(),
        country_id: z.number().int(),
      }).parse(req.body);

      // Get or create subscriber record
      let subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) {
        [subscriber] = await db('subscribers')
          .insert({ user_id: req.session.userId, tier: 'starter' })
          .returning('*');
      }

      // Verify vertical_country exists and is active
      const vc = await db('vertical_countries')
        .where({ vertical_id: data.vertical_id, country_id: data.country_id, status: 'active' })
        .first();
      if (!vc) return res.status(400).json({ success: false, error: { code: 'NOT_ACTIVE', message: 'Vertical not active in this country' } });

      // Check if already subscribed
      const existing = await db('subscriptions')
        .where({ subscriber_id: subscriber.id, vertical_id: data.vertical_id, country_id: data.country_id })
        .first();
      if (existing && existing.status === 'active') {
        return res.status(409).json({ success: false, error: { code: 'ALREADY_SUBSCRIBED', message: 'Already subscribed to this vertical in this country' } });
      }

      const [subscription] = await db('subscriptions')
        .insert({
          subscriber_id: subscriber.id,
          vertical_id: data.vertical_id,
          country_id: data.country_id,
          price_locked: vc.price || 0,
          currency: vc.currency_code || 'USD',
          status: 'active',
          period_start: new Date(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning('*');

      res.status(201).json({ success: true, data: { subscription } });
    } catch (error) {
      next(error);
    }
  });

  // List my subscriptions
  router.get('/subscriptions', requireAuth, async (req: any, res, next) => {
    try {
      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) return res.json({ success: true, data: { subscriptions: [] } });

      const subscriptions = await db('subscriptions')
        .where('subscriber_id', subscriber.id)
        .join('verticals', 'subscriptions.vertical_id', 'verticals.id')
        .join('countries', 'subscriptions.country_id', 'countries.id')
        .select(
          'subscriptions.*',
          'verticals.name as vertical_name', 'verticals.slug as vertical_slug',
          'countries.name as country_name', 'countries.code as country_code', 'countries.flag_emoji',
        )
        .orderBy('subscriptions.created_at', 'desc');

      res.json({ success: true, data: { subscriptions } });
    } catch (error) {
      next(error);
    }
  });

  // Cancel subscription
  router.delete('/subscriptions/:id', requireAuth, async (req: any, res, next) => {
    try {
      const subscriber = await db('subscribers').where('user_id', req.session.userId).first();
      if (!subscriber) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No subscriber record' } });

      const [sub] = await db('subscriptions')
        .where({ id: req.params.id, subscriber_id: subscriber.id })
        .update({ status: 'cancelled' })
        .returning('*');

      if (!sub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } });

      res.json({ success: true, data: { subscription: sub, message: 'Subscription cancelled' } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
