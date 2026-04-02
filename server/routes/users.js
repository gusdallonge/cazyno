import db from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';
import { logAction } from '../lib/audit.js';

export default async function userRoutes(fastify) {
  // List all users (admin only)
  fastify.get('/users', { preHandler: [authenticate, requireAdmin] }, async () => {
    const { rows } = await db.query(
      'SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  });

  // Update user role (admin only)
  fastify.patch('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = request.params;
    const { role } = request.body;
    const { rows } = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role',
      [role, id]
    );

    await logAction({
      actorId: request.user.id, actorEmail: request.user.email,
      action: 'change_role', targetType: 'user', targetId: id,
      details: { newRole: role }, ip: request.ip
    });

    return rows[0];
  });
}
