import { apiFetch } from '../client.js';

export const Integrations = {
  async SendEmail({ to, subject, body }) {
    return apiFetch('/integrations/send-email', {
      method: 'POST',
      body: JSON.stringify({ to, subject, body }),
    });
  },

  async InvokeLLM({ prompt }) {
    return apiFetch('/integrations/llm', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },
};
