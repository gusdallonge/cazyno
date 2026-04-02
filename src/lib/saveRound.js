import { api } from '@/api';

/**
 * Sauvegarde une partie en base de données.
 * @param {{ game: string, bet: number, result: string, profit: number }} round
 */
export async function saveRound({ game, bet, result, profit }) {
  try {
    const user = await api.auth.me();
    await api.entities.GameRound.create({
      game,
      user_email: user.email,
      user_name: user.full_name || user.email,
      bet: parseFloat(Number(bet).toFixed(2)),
      result: String(result),
      profit: parseFloat(Number(profit).toFixed(2)),
    });
  } catch (e) {}
}
