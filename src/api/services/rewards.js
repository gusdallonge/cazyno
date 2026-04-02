import { apiFetch } from '../client.js';

export const Rewards = {
  async getDaily() { return apiFetch('/rewards/daily'); },
  async claimDaily() { return apiFetch('/rewards/claim-daily', { method: 'POST' }); },
  async claimRakeback() { return apiFetch('/rewards/claim-rakeback', { method: 'POST' }); },
};
