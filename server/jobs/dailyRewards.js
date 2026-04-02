import db from '../db.js';
import { sendDailyRewardAvailable } from '../lib/email.js';

/**
 * Daily Rewards Job — runs once per day at midnight UTC.
 *
 * For each user with daily_stats for today whose daily_reward_claimed !== today:
 *   - If net winner: reward = 0.15% of total wagered today
 *   - If net loser:  reward = 1% of losses today
 *   - If reward > 0 and not yet claimed: send email notification
 */
export async function runDailyRewards() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const { rows: profiles } = await db.query(
      `SELECT id, user_email, user_name, daily_stats, daily_reward_claimed
       FROM user_profiles
       WHERE is_banned = false AND is_frozen = false`
    );

    for (const profile of profiles) {
      // Skip if already claimed today
      if (profile.daily_reward_claimed === today) continue;

      const stats = profile.daily_stats || {};
      const todayStats = stats[today];
      if (!todayStats) continue;

      const wagered = Number(todayStats.wagered || 0);
      const won = Number(todayStats.won || 0);
      const netProfit = won - wagered;

      let reward = 0;
      if (netProfit >= 0) {
        // Winner: 0.15% of wagered
        reward = Math.floor(wagered * 0.0015);
      } else {
        // Loser: 1% of losses
        const losses = Math.abs(netProfit);
        reward = Math.floor(losses * 0.01);
      }

      if (reward <= 0) continue;

      // Store the computed reward in daily_stats for claiming later
      const updatedStats = {
        ...stats,
        [today]: { ...todayStats, pendingReward: reward },
      };

      await db.query(
        `UPDATE user_profiles SET daily_stats = $1 WHERE id = $2`,
        [JSON.stringify(updatedStats), profile.id]
      );

      // Send email notification
      const name = profile.user_name || profile.user_email.split('@')[0];
      await sendDailyRewardAvailable(profile.user_email, name, reward);
    }

    console.log(`[job:dailyRewards] Completed for ${today}`);
  } catch (err) {
    console.error('[job:dailyRewards] Error:', err);
  }
}
