import { apiFetch, setToken } from '../client.js';

export const Auth = {
  async me() {
    return apiFetch('/auth/me');
  },

  async signup({ email, password, full_name, turnstileToken }) {
    const { token, user } = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, turnstileToken }),
    });
    setToken(token);
    return user;
  },

  async login({ email, password, turnstileToken }) {
    const { token, user } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, turnstileToken }),
    });
    setToken(token);
    return user;
  },

  async sendCode({ email }) {
    return apiFetch('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyCode({ email, code }) {
    const { token, user } = await apiFetch('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    setToken(token);
    return user;
  },

  async logout(redirectUrl) {
    setToken(null);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(returnUrl) {
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    }
    window.location.href = '/login';
  },
};
