import db from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';
import { logAction } from '../lib/audit.js';

export default async function userProfileRoutes(fastify) {
  // Create profile
  fastify.post('/user-profiles', { preHandler: [authenticate] }, async (request, reply) => {
    const data = request.body;
    const { rows } = await db.query(
      `INSERT INTO user_profiles (auth_user_id, user_email, user_name, credits, xp, rakeback,
        total_wagered, total_won, games_played, transactions, grade_rewards,
        daily_stats, daily_reward_claimed, wallet, is_banned, is_frozen, admin_notes, last_seen)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        data.auth_user_id, data.user_email, data.user_name,
        data.credits ?? 1000, data.xp ?? 0, data.rakeback ?? 0,
        data.total_wagered ?? 0, data.total_won ?? 0, data.games_played ?? 0,
        JSON.stringify(data.transactions ?? []),
        JSON.stringify(data.grade_rewards ?? []),
        JSON.stringify(data.daily_stats ?? {}),
        data.daily_reward_claimed ?? '',
        JSON.stringify(data.wallet ?? { btc: 0, eth: 0, usdt: 0, sol: 0 }),
        data.is_banned ?? false,
        data.is_frozen ?? false,
        data.admin_notes ?? '',
        data.last_seen ?? new Date().toISOString(),
      ]
    );
    return rows[0];
  });

  // List profiles (admin only)
  fastify.get('/user-profiles', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { sort = '-updated_at', limit = 200 } = request.query;
    const ascending = !sort.startsWith('-');
    const column = sort.replace(/^-/, '').replace('updated_date', 'updated_at').replace('created_date', 'created_at');
    const allowed = ['updated_at', 'created_at', 'user_email', 'credits', 'xp'];
    const col = allowed.includes(column) ? column : 'updated_at';
    const { rows } = await db.query(
      `SELECT * FROM user_profiles ORDER BY ${col} ${ascending ? 'ASC' : 'DESC'} LIMIT $1`,
      [parseInt(limit)]
    );
    return rows;
  });

  // Filter profiles
  fastify.get('/user-profiles/filter', { preHandler: [authenticate] }, async (request, reply) => {
    const { user_email, id } = request.query;
    // Non-admin can only filter their own email
    if (request.user.role !== 'admin' && user_email !== request.user.email) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    let rows;
    if (id) {
      ({ rows } = await db.query('SELECT * FROM user_profiles WHERE id = $1', [id]));
    } else if (user_email) {
      ({ rows } = await db.query('SELECT * FROM user_profiles WHERE user_email = $1', [user_email]));
    } else {
      return reply.code(400).send({ error: 'Provide user_email or id' });
    }
    return rows;
  });

  // Update profile
  fastify.patch('/user-profiles/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params;
    let patch = { ...request.body };

    const isAdmin = request.user.role === 'admin';

    // Check ownership or admin
    if (!isAdmin) {
      const { rows } = await db.query('SELECT auth_user_id FROM user_profiles WHERE id = $1', [id]);
      if (rows.length === 0 || rows[0].auth_user_id !== request.user.id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
    }

    // Field whitelist: regular users can only update user_name
    if (!isAdmin) {
      const USER_ALLOWED_FIELDS = ['user_name'];
      const requestedKeys = Object.keys(patch);
      const forbidden = requestedKeys.filter((k) => !USER_ALLOWED_FIELDS.includes(k));
      if (forbidden.length > 0) {
        return reply.code(403).send({
          error: `You are not allowed to update: ${forbidden.join(', ')}`,
        });
      }
      // Only keep allowed fields
      patch = Object.fromEntries(
        Object.entries(patch).filter(([k]) => USER_ALLOWED_FIELDS.includes(k))
      );
    }

    // Build dynamic SET clause
    const keys = Object.keys(patch);
    if (keys.length === 0) return reply.code(400).send({ error: 'No fields to update' });

    const jsonFields = ['transactions', 'grade_rewards', 'daily_stats', 'wallet'];
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`);
    const values = keys.map(k => jsonFields.includes(k) ? JSON.stringify(patch[k]) : patch[k]);

    const { rows } = await db.query(
      `UPDATE user_profiles SET ${setClauses.join(', ')}, updated_at = now() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );

    await logAction({
      actorId: request.user.id, actorEmail: request.user.email,
      action: 'update_profile', targetType: 'user_profile', targetId: id,
      details: patch, ip: request.ip
    });

    return rows[0];
  });
}
