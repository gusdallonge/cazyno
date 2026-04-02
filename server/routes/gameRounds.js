import db from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';
import {
  generateServerSeed,
  hashServerSeed,
  generateResult,
} from '../lib/provablyFair.js';
import { getGame } from '../lib/gameEngine.js';

const VALID_GAMES = new Set([
  'dice', 'blackjack', 'plinko', 'crash', 'roulette',
  'pulseBomb', 'pulse_bomb', 'chickenDrop', 'chicken_drop',
  'trader', 'mines', 'limbo',
]);

const RAKEBACK_RATE = 0.001; // 0.1% of bet

/**
 * Get or create the active (unrevealed) seed pair for a user.
 * Returns { id, server_seed, server_seed_hash, client_seed, nonce }.
 */
async function getActiveSeed(userId) {
  const { rows } = await db.query(
    `SELECT * FROM seeds WHERE user_id = $1 AND revealed = false ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (rows.length > 0) return rows[0];

  // Create a new seed pair
  const serverSeed = generateServerSeed();
  const serverSeedHash = hashServerSeed(serverSeed);

  const { rows: newRows } = await db.query(
    `INSERT INTO seeds (user_id, server_seed, server_seed_hash)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, serverSeed, serverSeedHash]
  );
  return newRows[0];
}

export default async function gameRoundRoutes(fastify) {
  // ──────────────────────────────────────────────────────────────────────────
  // POST /game-rounds/play  — Provably Fair server-side game execution
  // ──────────────────────────────────────────────────────────────────────────
  fastify.post('/game-rounds/play', { preHandler: [authenticate] }, async (request, reply) => {
    const { game, bet, params: gameParams = {} } = request.body || {};

    // --- Validate input ---
    if (!game || !VALID_GAMES.has(game)) {
      return reply.code(400).send({ error: `Invalid game. Must be one of: ${[...VALID_GAMES].join(', ')}` });
    }

    const betAmount = parseFloat(bet);
    if (!Number.isFinite(betAmount) || betAmount <= 0) {
      return reply.code(400).send({ error: 'Bet must be a positive number' });
    }
    if (betAmount > 1_000_000) {
      return reply.code(400).send({ error: 'Bet exceeds maximum (1,000,000)' });
    }

    const gameFn = getGame(game);
    if (!gameFn) {
      return reply.code(400).send({ error: `Game engine not found for: ${game}` });
    }

    const userId = request.user.id;
    const userEmail = request.user.email;

    // --- Atomic transaction ---
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Lock the user profile row to prevent concurrent balance manipulation
      const { rows: profileRows } = await client.query(
        `SELECT id, credits, user_name, total_wagered, total_won, games_played
         FROM user_profiles WHERE auth_user_id = $1 FOR UPDATE`,
        [userId]
      );

      if (profileRows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ error: 'User profile not found' });
      }

      const profile = profileRows[0];
      const currentCredits = parseFloat(profile.credits);

      if (betAmount > currentCredits) {
        await client.query('ROLLBACK');
        return reply.code(400).send({ error: 'Insufficient credits' });
      }

      // --- Provably Fair seed ---
      const seed = await getActiveSeed(userId);
      const nonce = seed.nonce;
      const result = generateResult(seed.server_seed, seed.client_seed, nonce);

      // Increment nonce
      await client.query(
        `UPDATE seeds SET nonce = nonce + 1 WHERE id = $1`,
        [seed.id]
      );

      // --- Run game logic ---
      const outcome = gameFn(result, gameParams);
      const profit = parseFloat((betAmount * outcome.multiplier - betAmount).toFixed(2));
      const payout = parseFloat((betAmount * outcome.multiplier).toFixed(2));
      const rakeback = parseFloat((betAmount * RAKEBACK_RATE).toFixed(2));

      // --- Update credits ---
      const newCredits = parseFloat((currentCredits - betAmount + payout + rakeback).toFixed(2));

      await client.query(
        `UPDATE user_profiles
         SET credits = $1,
             total_wagered = total_wagered + $2,
             total_won = total_won + $3,
             games_played = games_played + 1,
             rakeback = rakeback + $4
         WHERE id = $5`,
        [newCredits, betAmount, payout, rakeback, profile.id]
      );

      // --- Save game round ---
      const resultLabel = outcome.won ? 'win' : 'loss';
      await client.query(
        `INSERT INTO game_rounds (game, user_email, user_name, bet, result, profit)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [game, userEmail, profile.user_name, betAmount, resultLabel, profit]
      );

      await client.query('COMMIT');

      return {
        result: outcome.details,
        won: outcome.won,
        multiplier: outcome.multiplier,
        profit,
        payout,
        rakeback,
        newBalance: newCredits,
        serverSeedHash: seed.server_seed_hash,
        nonce,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      request.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /game-rounds/rotate-seed  — Reveal old seed and generate new one
  // ──────────────────────────────────────────────────────────────────────────
  fastify.post('/game-rounds/rotate-seed', { preHandler: [authenticate] }, async (request) => {
    const userId = request.user.id;

    // Reveal current seed
    const { rows: oldSeeds } = await db.query(
      `UPDATE seeds SET revealed = true
       WHERE user_id = $1 AND revealed = false
       RETURNING server_seed, server_seed_hash, client_seed, nonce`,
      [userId]
    );

    // Create new seed
    const newSeed = await getActiveSeed(userId);

    return {
      previousSeed: oldSeeds[0] || null,
      newServerSeedHash: newSeed.server_seed_hash,
    };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /game-rounds/seed  — Get current seed hash & nonce (no secret revealed)
  // ──────────────────────────────────────────────────────────────────────────
  fastify.get('/game-rounds/seed', { preHandler: [authenticate] }, async (request) => {
    const seed = await getActiveSeed(request.user.id);
    return {
      serverSeedHash: seed.server_seed_hash,
      clientSeed: seed.client_seed,
      nonce: seed.nonce,
    };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /game-rounds  — Legacy: save a game round (kept for compatibility)
  // ──────────────────────────────────────────────────────────────────────────
  fastify.post('/game-rounds', { preHandler: [authenticate] }, async (request) => {
    const { game, user_email, user_name, bet, result, profit } = request.body;
    const { rows } = await db.query(
      `INSERT INTO game_rounds (game, user_email, user_name, bet, result, profit)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [game, user_email, user_name, bet, result, profit]
    );
    return rows[0];
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /game-rounds  — List game rounds (admin only)
  // ──────────────────────────────────────────────────────────────────────────
  fastify.get('/game-rounds', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { sort = '-created_date', limit = 500 } = request.query;
    const ascending = !sort.startsWith('-');
    const { rows } = await db.query(
      `SELECT * FROM game_rounds ORDER BY created_date ${ascending ? 'ASC' : 'DESC'} LIMIT $1`,
      [parseInt(limit)]
    );
    return rows;
  });
}
