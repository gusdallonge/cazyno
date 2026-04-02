import db from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';

export default async function auditRoutes(fastify) {
  // GET /audit/logs — admin only, last 200 logs
  fastify.get('/audit/logs', { preHandler: [authenticate, requireAdmin] }, async () => {
    const { rows } = await db.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200'
    );
    return rows;
  });
}
