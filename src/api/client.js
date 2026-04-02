const API_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('cazyno_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('cazyno_token', token);
  } else {
    localStorage.removeItem('cazyno_token');
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  return res.json().catch(() => ({}));
}
