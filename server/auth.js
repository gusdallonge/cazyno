import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Fastify preHandler: attaches request.user
export async function authenticate(request, reply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Not authenticated' });
  }
  try {
    request.user = verifyToken(header.slice(7));
  } catch {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

// Fastify preHandler: requires admin role (must be chained after authenticate)
export async function requireAdmin(request, reply) {
  if (request.user?.role !== 'admin') {
    return reply.code(403).send({ error: 'Admin required' });
  }
}
