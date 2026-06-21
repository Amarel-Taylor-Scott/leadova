import { Router } from 'express';
import type { Knex } from 'knex';

export function blogRoutes(db: Knex): Router {
  const router = Router();

  // Public: list published posts
  router.get('/blog', async (_req, res, next) => {
    try {
      const posts = await db('blog_posts')
        .where('status', 'published')
        .whereNotNull('published_at')
        .select('id', 'slug', 'title', 'excerpt', 'author', 'published_at', 'seo_title', 'seo_description')
        .orderBy('published_at', 'desc');

      res.json({ success: true, data: { posts } });
    } catch (error) {
      next(error);
    }
  });

  // Public: single post
  router.get('/blog/:slug', async (req, res, next) => {
    try {
      const post = await db('blog_posts')
        .where({ slug: req.params.slug, status: 'published' })
        .first();

      if (!post) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });

      res.json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
