const OrderStore = (function () {
  'use strict';

  async function create(payload) {
    try {
      return await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  async function confirmPayment(orderId, session) {
    try {
      return await apiRequest(`/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        body: JSON.stringify({ session })
      });
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  async function list(session) {
    try {
      const encoded = encodeURIComponent(JSON.stringify(session));
      return await apiRequest(`/orders?session=${encoded}`);
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  async function getById(orderId, session) {
    try {
      const encoded = encodeURIComponent(JSON.stringify(session));
      return await apiRequest(`/orders/${orderId}?session=${encoded}`);
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  async function updateStatus(orderId, status, session) {
    try {
      return await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, session })
      });
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  return {
    create,
    confirmPayment,
    list,
    getById,
    updateStatus
  };
})();
