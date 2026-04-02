import { apiFetch } from '../client.js';

export const AppUser = {
  async list() {
    return apiFetch('/users');
  },

  async update(userId, patch) {
    return apiFetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
};
