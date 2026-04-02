import { apiFetch } from '../client.js';

export const SupportTicket = {
  async create(data) {
    return apiFetch('/support-tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async list(sortField = '-created_date', limit = 100) {
    return apiFetch(`/support-tickets?sort=${encodeURIComponent(sortField)}&limit=${limit}`);
  },

  async filter(filters) {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/support-tickets/filter?${params}`);
  },

  async update(id, patch) {
    return apiFetch(`/support-tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
};
