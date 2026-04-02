import crypto from 'crypto';
import db from '../db.js';
import { authenticate } from '../auth.js';

export default async function affiliateRoutes(fastify) {
  // POST /affiliates/register — create affiliate profile for current user
  fastify.post('/affiliates/register', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user.id;

    // Check if already registered
    const existing = await db.query('SELECT id FROM affiliates WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Already registered as affiliate', affiliate: existing.rows[0] });
    }

    // Generate unique code (8 chars, alphanumeric)
    let code;
    let unique = false;
    while (!unique) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const check = await db.query('SELECT id FROM affiliates WHERE code = $1', [code]);
      if (check.rows.length === 0) unique = true;
    }

    const result = await db.query(
      `INSERT INTO affiliates (user_id, code) VALUES ($1, $2) RETURNING *`,
      [userId, code]
    );

    return reply.code(201).send(result.rows[0]);
  });

  // GET /affiliates/stats — get affiliate stats
  fastify.get('/affiliates/stats', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user.id;

    const aff = await db.query('SELECT * FROM affiliates WHERE user_id = $1', [userId]);
    if (aff.rows.length === 0) {
      return reply.code(404).send({ error: 'Not registered as affiliate' });
    }

    const affiliate = aff.rows[0];

    // Get aggregated referral stats
    const stats = await db.query(
      `SELECT
        COUNT(*) as total_referrals,
        COALESCE(SUM(ngr), 0) as total_ngr,
        COALESCE(SUM(commission_paid), 0) as total_commission,
        COALESCE(SUM(deposits_count), 0) as total_deposits
      FROM referrals WHERE affiliate_id = $1`,
      [affiliate.id]
    );

    return {
      id: affiliate.id,
      code: affiliate.code,
      tier: affiliate.tier,
      total_referred: affiliate.total_referred,
      total_ngr: parseFloat(affiliate.total_ngr),
      total_commission: parseFloat(affiliate.total_commission),
      referral_stats: {
        total_referrals: parseInt(stats.rows[0].total_referrals),
        total_ngr: parseFloat(stats.rows[0].total_ngr),
        total_commission: parseFloat(stats.rows[0].total_commission),
        total_deposits: parseInt(stats.rows[0].total_deposits),
      },
      created_at: affiliate.created_at,
    };
  });

  // GET /affiliates/referrals — list referred users
  fastify.get('/affiliates/referrals', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user.id;

    const aff = await db.query('SELECT id FROM affiliates WHERE user_id = $1', [userId]);
    if (aff.rows.length === 0) {
      return reply.code(404).send({ error: 'Not registered as affiliate' });
    }

    const referrals = await db.query(
      `SELECT r.id, r.ngr, r.commission_paid, r.deposits_count, r.created_at,
              u.email as referred_email, up.user_name as referred_name
       FROM referrals r
       JOIN users u ON u.id = r.referred_user_id
       LEFT JOIN user_profiles up ON up.auth_user_id = r.referred_user_id
       WHERE r.affiliate_id = $1
       ORDER BY r.created_at DESC`,
      [aff.rows[0].id]
    );

    return referrals.rows.map(r => ({
      id: r.id,
      referred_email: r.referred_email,
      referred_name: r.referred_name,
      ngr: parseFloat(r.ngr),
      commission_paid: parseFloat(r.commission_paid),
      deposits_count: r.deposits_count,
      created_at: r.created_at,
    }));
  });
}
