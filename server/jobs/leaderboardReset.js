import db from '../db.js';

/**
 * Leaderboard Reset Job — runs daily but only acts on the 1st of each month.
 *
 * - Queries top 15 users by total_wagered
 * - Distributes prize credits to their accounts
 * - Resets the monthly wagered counter (total_wagered) for all users
 */

const PRIZES = [
  30000, // 1st
  20000, // 2nd
  10000, // 3rd
  7500,  // 4th
  5000,  // 5th
  4000,  // 6th
  3000,  // 7th
  2500,  // 8th
  2000,  // 9th
  1500,  // 10th
  1000,  // 11th
  750,   // 12th
  500,   // 13th
  250,   // 14th
  100,   // 15th
];

export async function runLeaderboardReset() {
  const now = new Date();

  // Only run on the 1st of the month
  if (now.getUTCDate() !== 1) return;

  try {
    // Get top 15 users by total_wagered
    const { rows: topUsers } = await db.query(
      `SELECT id, user_email, user_name, credits, total_wagered
       FROM user_profiles
       WHERE is_banned = false
       ORDER BY total_wagered DESC
       LIMIT 15`
    );

    const month = now.toISOString().slice(0, 7); // e.g. "2026-03"

    // Distribute prizes
    for (let i = 0; i < topUsers.length && i < PRIZES.length; i++) {
      const user = topUsers[i];
      const prize = PRIZES[i];

      await db.query(
        `UPDATE user_profiles
         SET credits = credits + $1
         WHERE id = $2`,
        [prize, user.id]
      );

      console.log(`[job:leaderboardReset] #${i + 1} ${user.user_name || user.user_email}: +${prize} credits (wagered: ${user.total_wagered})`);
    }

    // Reset monthly wagered for all users
    await db.query(`UPDATE user_profiles SET total_wagered = 0`);

    console.log(`[job:leaderboardReset] Completed for ${month}. ${topUsers.length} users rewarded.`);
  } catch (err) {
    console.error('[job:leaderboardReset] Error:', err);
  }
}
