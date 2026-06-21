import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';

export function waitlistRoutes(db: Knex): Router {
  const router = Router();

  // Public: join waitlist
  router.post('/waitlist', async (req, res, next) => {
    try {
      const data = z.object({
        email: z.string().email().max(255),
        vertical_slug: z.string().max(100).optional(),
        country_code: z.string().length(2).optional(),
        user_type: z.enum(['lead', 'subscriber', 'agent']).default('lead'),
        source: z.string().max(255).optional(),
      }).parse(req.body);

      await db('waitlist').insert(data);

      res.status(201).json({ success: true, data: { message: 'Added to waitlist' } });
    } catch (error) {
      next(error);
    }
  });

  // Public: waitlist count
  router.get('/waitlist/count', async (_req, res, next) => {
    try {
      const [{ count }] = await db('waitlist').count('* as count');
      res.json({ success: true, data: { count: Number(count) } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
