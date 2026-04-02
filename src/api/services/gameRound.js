import { apiFetch } from '../client.js';

export const GameRound = {
  async create(data) {
    return apiFetch('/game-rounds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async list(sortField = '-created_date', limit = 500) {
    return apiFetch(`/game-rounds?sort=${encodeURIComponent(sortField)}&limit=${limit}`);
  },
};
