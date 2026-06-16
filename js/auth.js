const Auth = (function () {
  'use strict';

  const SESSION_KEY = 'ecomma_session';
  const DEFAULT_ADMIN = {
    email: 'admin@ecomma.rw',
    password: 'EcommaAdmin2026',
    role: 'admin',
    name: 'Platform Admin'
  };

  function setSession(user) {
    const session = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || user.email.split('@')[0],
      shopName: user.shopName || null
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async function register({ email, password, role, name, shopName }) {
    try {
      const result = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, name, shopName })
      });

      if (!result.ok) return result;
      return { ok: true, user: setSession(result.user) };
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Start XAMPP MySQL and run the Ecomma server.' };
    }
  }

  async function login(email, password) {
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (!result.ok) return result;
      return { ok: true, user: setSession(result.user) };
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Start XAMPP MySQL and run the Ecomma server.' };
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function redirectForRole(role) {
    if (role === 'admin') return 'admin/dashboard.html';
    if (role === 'seller') return 'seller/dashboard.html';
    return 'index.html';
  }

  function requireRole(allowedRoles, loginPath) {
    const session = getSession();
    const login = loginPath || '../login.html';

    if (!session) {
      window.location.href = login;
      return null;
    }

    if (!allowedRoles.includes(session.role)) {
      window.location.href = '../index.html';
      return null;
    }

    return session;
  }

  function canPostProducts(session) {
    return session && (session.role === 'seller' || session.role === 'admin');
  }

  function canRemoveProducts(session) {
    return session && session.role === 'admin';
  }

  return {
    register,
    login,
    logout,
    getSession,
    setSession,
    redirectForRole,
    requireRole,
    canPostProducts,
    canRemoveProducts,
    DEFAULT_ADMIN_EMAIL: DEFAULT_ADMIN.email
  };
})();
