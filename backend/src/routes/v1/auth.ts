import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Knex } from 'knex';

const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(10).max(200),
  name: z.string().max(255).optional(),
  role: z.enum(['subscriber', 'agent']).default('subscriber'),
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

function signToken(userId: number, role: string): string {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET ?? 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
  );
}

export function requireAuth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET ?? 'dev-secret') as any;
    req.session = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.session || !roles.includes(req.session.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
}

export function authRoutes(db: Knex): Router {
  const router = Router();

  router.post('/auth/signup', async (req, res, next) => {
    try {
      const data = signupSchema.parse(req.body);
      const exists = await db('users').where('email', data.email).first();
      if (exists) {
        return res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
      }

      const hash = await bcrypt.hash(data.password, 12);
      const [user] = await db('users')
        .insert({ email: data.email, password: hash, name: data.name, role: data.role })
        .returning(['id', 'email', 'name', 'role', 'created_at']);

      const token = signToken(user.id, user.role);
      res.status(201).json({ success: true, data: { token, user } });
    } catch (error) {
      next(error);
    }
  });

  router.post('/auth/login', async (req, res, next) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await db('users').where('email', data.email).first();
      if (!user || !(await bcrypt.compare(data.password, user.password))) {
        return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      }

      await db('users').where('id', user.id).update({ updated_at: db.fn.now() });
      const token = signToken(user.id, user.role);

      res.json({
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/auth/logout', (_req, res) => {
    res.json({ success: true });
  });

  router.post('/auth/forgot-password', async (req, res, next) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      const user = await db('users').where('email', email).first();
      // Always return success to prevent email enumeration
      res.json({ success: true, data: { message: 'If that email exists, a reset link has been sent.' } });
    } catch (error) {
      next(error);
    }
  });

  router.get('/auth/me', requireAuth, async (req: any, res, next) => {
    try {
      const user = await db('users')
        .select('id', 'email', 'name', 'role', 'created_at')
        .where('id', req.session.userId)
        .first();
      if (!user) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      }

      // If subscriber, include subscriber info
      let subscriber = null;
      if (user.role === 'subscriber') {
        subscriber = await db('subscribers').where('user_id', user.id).first();
      }

      // If agent, include agent info
      let agent = null;
      if (user.role === 'agent') {
        agent = await db('agents').where('user_id', user.id).first();
      }

      res.json({ success: true, data: { user, subscriber, agent } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
