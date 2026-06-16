const API_BASE = (function () {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3000/api';
  }
  return `${window.location.origin}/api`;
})();

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_err) {
    data = { ok: false, error: 'Invalid server response.' };
  }

  if (!response.ok && data?.ok !== false) {
    data = { ok: false, error: data?.error || 'Request failed.' };
  }

  return data;
}
