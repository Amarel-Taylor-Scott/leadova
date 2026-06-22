import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from './auth';

const SECRET = 'test-secret-leadova';

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

/** Minimal Express res mock that records status + json body. */
function mockRes() {
  const res: any = { statusCode: 200, body: undefined };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: unknown) => {
    res.body = body;
    return res;
  };
  return res;
}

describe('requireAuth middleware', () => {
  it('calls next() and attaches { userId, role } for a valid Bearer token', () => {
    const token = jwt.sign({ userId: 99, role: 'agent' }, SECRET);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let nextCalled = false;

    requireAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.session).toEqual({ userId: 99, role: 'agent' });
  });

  it('responds 401 when the Authorization header is missing', () => {
    const req: any = { headers: {} };
    const res = mockRes();
    let nextCalled = false;

    requireAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({ success: false });
  });

  it('responds 401 for a malformed token', () => {
    const req: any = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    let nextCalled = false;

    requireAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  it('responds 401 for a token signed with a different secret', () => {
    const token = jwt.sign({ userId: 1, role: 'subscriber' }, 'some-other-secret');
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let nextCalled = false;

    requireAuth(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
  });
});

describe('requireRole middleware', () => {
  it('calls next() when the session role is allowed', () => {
    const mw = requireRole('agent', 'subscriber');
    const req: any = { session: { userId: 1, role: 'agent' } };
    const res = mockRes();
    let nextCalled = false;

    mw(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it('responds 403 when the session role is not allowed', () => {
    const mw = requireRole('agent');
    const req: any = { session: { userId: 1, role: 'subscriber' } };
    const res = mockRes();
    let nextCalled = false;

    mw(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  it('responds 403 when there is no session', () => {
    const mw = requireRole('agent');
    const req: any = {};
    const res = mockRes();
    let nextCalled = false;

    mw(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});
