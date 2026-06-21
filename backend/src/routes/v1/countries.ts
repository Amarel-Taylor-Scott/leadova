import { Router } from 'express';
import type { Knex } from 'knex';

export function countryRoutes(db: Knex): Router {
  const router = Router();

  // Public: list all countries with their verticals
  router.get('/countries', async (_req, res, next) => {
    try {
      const countries = await db('countries').orderBy('name');

      const withVerticals = await Promise.all(
        countries.map(async (c: any) => {
          const verticals = await db('vertical_countries')
            .join('verticals', 'vertical_countries.vertical_id', 'verticals.id')
            .where('vertical_countries.country_id', c.id)
            .select(
              'verticals.slug', 'verticals.name', 'verticals.icon',
              'vertical_countries.status', 'vertical_countries.price', 'vertical_countries.currency_code',
            );
          return { ...c, verticals };
        }),
      );

      res.json({ success: true, data: { countries: withVerticals } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
