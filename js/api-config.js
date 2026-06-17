const API_BASE = (function () {
  const host = window.location.hostname;
  const LOCAL_API = 'http://localhost:3000/api';

  // Production (Vercel, custom domain, etc.) — API runs on same host via /api
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }

  if (window.location.protocol === 'file:') {
    return LOCAL_API;
  }

  if (window.location.port === '3000') {
    return `${window.location.origin}/api`;
  }

  return LOCAL_API;
})();

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch (_err) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return {
      ok: false,
      error: isLocal
        ? 'Cannot reach the Ecomma server. Start MySQL in XAMPP, then run: cd server && npm start'
        : 'Cannot reach the API. Check Vercel environment variables and redeploy.'
    };
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const isOnline = window.location.hostname.includes('vercel.app') || !window.location.hostname.match(/localhost|127\.0\.0\.1/);
    if (response.status === 504) {
      return {
        ok: false,
        error: 'Server timed out. Add cloud MySQL env vars in Vercel, redeploy, then try again.'
      };
    }
    return {
      ok: false,
      error: isOnline
        ? 'API not responding. Add MySQL env vars in Vercel → Settings → Environment Variables, then redeploy.'
        : 'Invalid server response. Open http://localhost:3000 and ensure the server is running.'
    };
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_err) {
    return { ok: false, error: 'Invalid server response.' };
  }

  if (!response.ok && data?.ok !== false) {
    data = { ok: false, error: data?.error || 'Request failed.' };
  }

  return data;
}
