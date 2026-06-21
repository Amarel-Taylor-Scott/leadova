import { Router } from 'express';
import type { Knex } from 'knex';

export function verticalRoutes(db: Knex): Router {
  const router = Router();

  // Public: list all verticals
  router.get('/verticals', async (_req, res, next) => {
    try {
      const verticals = await db('verticals')
        .select('id', 'slug', 'name', 'description', 'icon', 'status')
        .orderBy('name');

      // For each vertical, get countries
      const withCountries = await Promise.all(
        verticals.map(async (v: any) => {
          const countries = await db('vertical_countries')
            .join('countries', 'vertical_countries.country_id', 'countries.id')
            .where('vertical_countries.vertical_id', v.id)
            .select(
              'countries.code', 'countries.name', 'countries.flag_emoji',
              'vertical_countries.status', 'vertical_countries.price', 'vertical_countries.currency_code',
            );
          return { ...v, countries };
        }),
      );

      res.json({ success: true, data: { verticals: withCountries } });
    } catch (error) {
      next(error);
    }
  });

  // Public: get vertical detail with all countries
  router.get('/verticals/:slug', async (req, res, next) => {
    try {
      const vertical = await db('verticals').where('slug', req.params.slug).first();
      if (!vertical) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical not found' } });
      }

      const countries = await db('vertical_countries')
        .join('countries', 'vertical_countries.country_id', 'countries.id')
        .where('vertical_countries.vertical_id', vertical.id)
        .select(
          'countries.id as country_id', 'countries.code', 'countries.name', 'countries.flag_emoji',
          'countries.currency_code', 'countries.currency_symbol',
          'vertical_countries.*',
        );

      res.json({ success: true, data: { vertical, countries } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
