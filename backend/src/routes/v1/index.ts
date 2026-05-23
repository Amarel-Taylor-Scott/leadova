import { Router } from 'express';
import type { Knex } from 'knex';
import { authRoutes } from './auth.js';
import { verticalRoutes } from './verticals.js';
import { leadRoutes } from './leads.js';
import { subscriberRoutes } from './subscribers.js';
import { agentRoutes } from './agents.js';
import { waitlistRoutes } from './waitlist.js';
import { countryRoutes } from './countries.js';
import { blogRoutes } from './blog.js';
import { adminRoutes } from './admin.js';
import { checkoutRoutes } from './checkout.js';
import { chatbotRoutes } from './chatbot.js';
import { importRoutes } from './import.js';

export function createRoutes(db: Knex): Router {
  const router = Router();

  router.use(authRoutes(db));
  router.use(verticalRoutes(db));
  router.use(leadRoutes(db));
  router.use(subscriberRoutes(db));
  router.use(agentRoutes(db));
  router.use(waitlistRoutes(db));
  router.use(countryRoutes(db));
  router.use(blogRoutes(db));
  router.use(adminRoutes(db));
  router.use(checkoutRoutes(db));
  router.use(chatbotRoutes(db));
  router.use(importRoutes(db));

  return router;
}
