import { apiFetch } from '../client.js';

export const UserProfile = {
  async create(data) {
    return apiFetch('/user-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async list(sortField = '-updated_at', limit = 200) {
    return apiFetch(`/user-profiles?sort=${encodeURIComponent(sortField)}&limit=${limit}`);
  },

  async filter(filters) {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/user-profiles/filter?${params}`);
  },

  async update(id, patch) {
    return apiFetch(`/user-profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
};

export async function getTotalWagered() {
  return apiFetch('/rpc/total-wagered');
}
