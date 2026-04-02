import { apiFetch } from '../client.js';

export const Leaderboard = {
  async getMonthly() { return apiFetch('/leaderboard/monthly'); },
  async getMyPosition() { return apiFetch('/leaderboard/my-position'); },
};
