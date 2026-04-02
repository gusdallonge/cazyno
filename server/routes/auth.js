import crypto from 'crypto';
import db from '../db.js';
import { hashPassword, verifyPassword, signToken, authenticate } from '../auth.js';
import { sendLoginCode, sendWelcome } from '../lib/email.js';
import { logAction } from '../lib/audit.js';

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';

// In-memory store for magic codes (TTL 10 min)
const magicCodes = new Map();

async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) return true; // Skip if not configured
  if (!token) return false;

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: TURNSTILE_SECRET,
      response: token,
      remoteip: ip,
    }),
  });
  const data = await res.json();
  return data.success === true;
}

export default async function authRoutes(fastify) {
  fastify.post('/auth/signup', async (request, reply) => {
    const { email, password, full_name, turnstileToken } = request.body;
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password required' });
    }

    // Verify Turnstile
    const valid = await verifyTurnstile(turnstileToken, request.ip);
    if (!valid) {
      return reply.code(403).send({ error: 'Security verification failed' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Email already registered' });
    }

    const password_hash = await hashPassword(password);
    const { rows } = await db.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
      [email, password_hash, full_name || email]
    );

    const user = rows[0];
    const token = signToken(user);

    await logAction({
      actorId: user.id, actorEmail: user.email,
      action: 'signup', targetType: 'user', targetId: user.id,
      details: { full_name: full_name || email }, ip: request.ip
    });

    return { token, user };
  });

  fastify.post('/auth/login', async (request, reply) => {
    const { email, password, turnstileToken } = request.body;
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password required' });
    }

    // Verify Turnstile
    const valid = await verifyTurnstile(turnstileToken, request.ip);
    if (!valid) {
      return reply.code(403).send({ error: 'Security verification failed' });
    }

    const { rows } = await db.query(
      'SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = signToken(user);

    await logAction({
      actorId: user.id, actorEmail: user.email,
      action: 'login', targetType: 'user', targetId: user.id,
      details: {}, ip: request.ip
    });

    return { token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } };
  });

  // ── Magic code: send code ──
  fastify.post('/auth/send-code', async (request, reply) => {
    const { email } = request.body;
    if (!email) return reply.code(400).send({ error: 'Email required' });

    const code = crypto.randomInt(100000, 999999).toString();
    magicCodes.set(email.toLowerCase(), { code, expires: Date.now() + 10 * 60 * 1000 });

    // Send email via centralized email module
    await sendLoginCode(email, code);

    return { success: true };
  });

  // ── Magic code: verify code ──
  fastify.post('/auth/verify-code', async (request, reply) => {
    const { email, code } = request.body;
    if (!email || !code) return reply.code(400).send({ error: 'Email and code required' });

    const entry = magicCodes.get(email.toLowerCase());
    if (!entry || entry.code !== code || Date.now() > entry.expires) {
      return reply.code(401).send({ error: 'Code invalide ou expire' });
    }
    magicCodes.delete(email.toLowerCase());

    // Check if user exists, if not create
    let { rows } = await db.query('SELECT id, email, full_name, role FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      // Auto-signup with random password (user won't need it)
      const password_hash = await hashPassword(crypto.randomBytes(32).toString('hex'));
      const userName = email.split('@')[0];
      const result = await db.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
        [email, password_hash, userName]
      );
      rows = result.rows;

      // Send welcome email to new users
      sendWelcome(email, userName).catch((err) =>
        console.error('[auth] Failed to send welcome email:', err)
      );
    }

    const user = rows[0];
    const token = signToken(user);
    return { token, user };
  });

  fastify.get('/auth/me', { preHandler: [authenticate] }, async (request) => {
    return request.user;
  });
}
