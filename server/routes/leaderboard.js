import db from '../db.js';
import { authenticate } from '../auth.js';

export default async function leaderboardRoutes(fastify) {
  // GET /leaderboard/monthly — top 30 players by total_wagered this month
  fastify.get('/leaderboard/monthly', async (request, reply) => {
    const { rows } = await db.query(`
      SELECT user_name, user_email, total_wagered, xp,
             ROW_NUMBER() OVER (ORDER BY total_wagered DESC) as rank
      FROM user_profiles
      ORDER BY total_wagered DESC
      LIMIT 30
    `);
    return rows;
  });

  // GET /leaderboard/my-position — current user's position
  fastify.get('/leaderboard/my-position', { preHandler: [authenticate] }, async (request) => {
    const { rows } = await db.query(`
      SELECT rank FROM (
        SELECT user_email, ROW_NUMBER() OVER (ORDER BY total_wagered DESC) as rank
        FROM user_profiles
      ) ranked WHERE user_email = $1
    `, [request.user.email]);
    return { position: rows[0]?.rank || null };
  });
}
