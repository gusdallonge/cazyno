import db from '../db.js';
import { sendInactivity } from '../lib/email.js';

/**
 * Inactivity Check Job — runs once per day.
 *
 * - Users inactive for 3 days: send a 3-day reminder email
 * - Users inactive for 7 days: send a 7-day reminder with bonus offer
 *
 * Only sends one email per threshold (uses the exact day boundary).
 */
export async function runInactivityCheck() {
  try {
    const now = new Date();

    // 3-day inactive users (last_seen between 3 and 4 days ago)
    const threeDayAgo = new Date(now);
    threeDayAgo.setDate(threeDayAgo.getDate() - 3);
    const fourDayAgo = new Date(now);
    fourDayAgo.setDate(fourDayAgo.getDate() - 4);

    const { rows: threeDayUsers } = await db.query(
      `SELECT user_email, user_name FROM user_profiles
       WHERE last_seen < $1 AND last_seen >= $2
         AND is_banned = false AND is_frozen = false`,
      [threeDayAgo.toISOString(), fourDayAgo.toISOString()]
    );

    for (const user of threeDayUsers) {
      const name = user.user_name || user.user_email.split('@')[0];
      await sendInactivity(user.user_email, name, 3);
    }

    // 7-day inactive users (last_seen between 7 and 8 days ago)
    const sevenDayAgo = new Date(now);
    sevenDayAgo.setDate(sevenDayAgo.getDate() - 7);
    const eightDayAgo = new Date(now);
    eightDayAgo.setDate(eightDayAgo.getDate() - 8);

    const { rows: sevenDayUsers } = await db.query(
      `SELECT user_email, user_name FROM user_profiles
       WHERE last_seen < $1 AND last_seen >= $2
         AND is_banned = false AND is_frozen = false`,
      [sevenDayAgo.toISOString(), eightDayAgo.toISOString()]
    );

    for (const user of sevenDayUsers) {
      const name = user.user_name || user.user_email.split('@')[0];
      await sendInactivity(user.user_email, name, 7);
    }

    console.log(`[job:inactivityCheck] Sent ${threeDayUsers.length} 3-day + ${sevenDayUsers.length} 7-day reminders`);
  } catch (err) {
    console.error('[job:inactivityCheck] Error:', err);
  }
}
