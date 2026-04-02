import db from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';

export default async function supportTicketRoutes(fastify) {
  // Create ticket
  fastify.post('/support-tickets', { preHandler: [authenticate] }, async (request) => {
    const { user_email, user_name, subject, status, priority, messages } = request.body;
    const { rows } = await db.query(
      `INSERT INTO support_tickets (user_email, user_name, subject, status, priority, messages)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_email, user_name, subject, status || 'open', priority || 'normal', JSON.stringify(messages || [])]
    );
    return rows[0];
  });

  // List tickets (admin only)
  fastify.get('/support-tickets', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { sort = '-created_date', limit = 100 } = request.query;
    const ascending = !sort.startsWith('-');
    const { rows } = await db.query(
      `SELECT * FROM support_tickets ORDER BY created_date ${ascending ? 'ASC' : 'DESC'} LIMIT $1`,
      [parseInt(limit)]
    );
    return rows;
  });

  // Filter tickets
  fastify.get('/support-tickets/filter', { preHandler: [authenticate] }, async (request, reply) => {
    const { user_email, id } = request.query;
    // Non-admin can only see their own tickets
    if (request.user.role !== 'admin' && user_email !== request.user.email) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    let rows;
    if (id) {
      ({ rows } = await db.query('SELECT * FROM support_tickets WHERE id = $1', [id]));
    } else if (user_email) {
      ({ rows } = await db.query('SELECT * FROM support_tickets WHERE user_email = $1', [user_email]));
    } else {
      return reply.code(400).send({ error: 'Provide user_email or id' });
    }
    return rows;
  });

  // Update ticket
  fastify.patch('/support-tickets/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params;
    const patch = request.body;

    // Check ownership or admin
    if (request.user.role !== 'admin') {
      const { rows } = await db.query('SELECT user_email FROM support_tickets WHERE id = $1', [id]);
      if (rows.length === 0 || rows[0].user_email !== request.user.email) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
    }

    const keys = Object.keys(patch);
    if (keys.length === 0) return reply.code(400).send({ error: 'No fields to update' });

    const jsonFields = ['messages'];
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`);
    const values = keys.map(k => jsonFields.includes(k) ? JSON.stringify(patch[k]) : patch[k]);

    const { rows } = await db.query(
      `UPDATE support_tickets SET ${setClauses.join(', ')}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0];
  });
}
