import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';
import { ChatbotService } from '../../services/chatbot-service.js';

export function chatbotRoutes(db: Knex): Router {
  const router = Router();
  const chatbot = new ChatbotService(db);

  // Start a new chatbot session
  router.post('/chatbot/start', async (req, res, next) => {
    try {
      const data = z.object({
        vertical_slug: z.string().min(1),
        country_code: z.string().length(2),
      }).parse(req.body);

      const response = await chatbot.startSession(data.vertical_slug, data.country_code);
      res.status(201).json({ success: true, data: response });
    } catch (error: any) {
      if (error.message === 'Vertical not found' || error.message === 'Country not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      if (error.message?.includes('not available') || error.message?.includes('not yet active')) {
        return res.status(400).json({ success: false, error: { code: 'NOT_ACTIVE', message: error.message } });
      }
      next(error);
    }
  });

  // Send a message to an active chatbot session
  router.post('/chatbot/message', async (req, res, next) => {
    try {
      const data = z.object({
        session_id: z.string().min(1),
        message: z.string().min(1).max(2000),
      }).parse(req.body);

      const response = await chatbot.processMessage(data.session_id, data.message);
      res.json({ success: true, data: response });
    } catch (error: any) {
      if (error.message === 'Session not found or expired') {
        return res.status(404).json({ success: false, error: { code: 'SESSION_NOT_FOUND', message: error.message } });
      }
      if (error.message === 'This session is already complete' || error.message === 'This session has expired') {
        return res.status(400).json({ success: false, error: { code: 'SESSION_ENDED', message: error.message } });
      }
      next(error);
    }
  });

  // Get current session state
  router.get('/chatbot/session/:id', async (req, res, _next) => {
    const state = chatbot.getSessionState(req.params.id);
    if (!state) {
      return res.status(404).json({ success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session not found or expired' } });
    }
    res.json({ success: true, data: state });
  });

  return router;
}
