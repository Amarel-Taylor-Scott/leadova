import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';
import { requireAuth } from './auth.js';

export function checkoutRoutes(db: Knex): Router {
  const router = Router();

  // Create Stripe checkout session
  router.post('/checkout', requireAuth, async (req: any, res, next) => {
    try {
      const data = z.object({
        vertical_id: z.number().int(),
        country_id: z.number().int(),
        tier: z.enum(['starter', 'growth', 'enterprise']).default('starter'),
      }).parse(req.body);

      const vc = await db('vertical_countries')
        .where({ vertical_id: data.vertical_id, country_id: data.country_id })
        .first();
      if (!vc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical/country not found' } });

      // In production, this creates a Stripe checkout session
      // For now, return a mock checkout URL
      res.json({
        success: true,
        data: {
          checkout_url: `https://checkout.stripe.com/placeholder?vertical=${data.vertical_id}&country=${data.country_id}&tier=${data.tier}`,
          message: 'Stripe integration pending. Subscription created directly for development.',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Stripe webhook
  router.post('/webhooks/stripe', async (req, res, next) => {
    try {
      // In production: verify Stripe signature, handle subscription lifecycle events
      // checkout.session.completed -> create subscription
      // invoice.paid -> renew period
      // customer.subscription.deleted -> cancel
      // invoice.payment_failed -> mark past_due

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
