import db from '../db.js';
import { authenticate } from '../auth.js';

export default async function rewardsRoutes(fastify) {
  // GET /rewards/daily — get today's daily reward status
  fastify.get('/rewards/daily', { preHandler: [authenticate] }, async (request) => {
    const { rows } = await db.query(
      'SELECT daily_stats, daily_reward_claimed FROM user_profiles WHERE user_email = $1',
      [request.user.email]
    );
    if (!rows[0]) return { available: false };

    const today = new Date().toISOString().slice(0, 10);
    const stats = rows[0].daily_stats?.[today];
    const claimed = rows[0].daily_reward_claimed === today;

    if (!stats || stats.wagered === 0) return { available: false, claimed };

    const isWinner = stats.won > stats.wagered;
    const losses = Math.max(0, stats.wagered - stats.won);
    const amount = isWinner ? parseFloat((stats.wagered * 0.0015).toFixed(2)) : parseFloat((losses * 0.01).toFixed(2));

    return { available: amount > 0, claimed, amount, isWinner, wagered: stats.wagered, won: stats.won };
  });

  // POST /rewards/claim-daily — claim today's daily reward
  fastify.post('/rewards/claim-daily', { preHandler: [authenticate] }, async (request, reply) => {
    const today = new Date().toISOString().slice(0, 10);
    const { rows } = await db.query(
      'SELECT id, daily_stats, daily_reward_claimed, credits FROM user_profiles WHERE user_email = $1',
      [request.user.email]
    );
    if (!rows[0]) return reply.code(404).send({ error: 'Profile not found' });

    const profile = rows[0];
    if (profile.daily_reward_claimed === today) return reply.code(400).send({ error: 'Already claimed today' });

    const stats = profile.daily_stats?.[today];
    if (!stats || stats.wagered === 0) return reply.code(400).send({ error: 'No activity today' });

    const isWinner = stats.won > stats.wagered;
    const losses = Math.max(0, stats.wagered - stats.won);
    const amount = isWinner ? parseFloat((stats.wagered * 0.0015).toFixed(2)) : parseFloat((losses * 0.01).toFixed(2));

    if (amount <= 0) return reply.code(400).send({ error: 'No reward available' });

    await db.query(
      'UPDATE user_profiles SET credits = credits + $1, daily_reward_claimed = $2 WHERE id = $3',
      [amount, today, profile.id]
    );

    return { success: true, amount, newBalance: parseFloat((profile.credits + amount).toFixed(2)) };
  });

  // POST /rewards/claim-rakeback — claim accumulated rakeback
  fastify.post('/rewards/claim-rakeback', { preHandler: [authenticate] }, async (request, reply) => {
    const { rows } = await db.query(
      'SELECT id, rakeback, credits FROM user_profiles WHERE user_email = $1',
      [request.user.email]
    );
    if (!rows[0] || rows[0].rakeback <= 0) return reply.code(400).send({ error: 'No rakeback to claim' });

    const amount = rows[0].rakeback;
    await db.query(
      'UPDATE user_profiles SET credits = credits + $1, rakeback = 0 WHERE id = $2',
      [amount, rows[0].id]
    );

    return { success: true, amount, newBalance: parseFloat((rows[0].credits + amount).toFixed(2)) };
  });
}
