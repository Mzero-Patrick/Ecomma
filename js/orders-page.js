(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const session = Auth.getSession();
  if (!session) {
    window.location.href = 'login.html?redirect=orders.html';
    return;
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString('en-RW', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function statusClass(status) {
    if (['delivered', 'confirmed', 'paid'].includes(status)) return 'status-badge--live';
    if (['cancelled', 'payment_failed'].includes(status)) return 'status-badge--danger';
    if (['shipped'].includes(status)) return 'status-badge--shipped';
    return 'status-badge--pending';
  }

  function renderOrders(orders) {
    if (!orders.length) {
      $('#ordersList').innerHTML = '';
      $('#ordersEmpty').hidden = false;
      return;
    }

    $('#ordersEmpty').hidden = true;
    $('#ordersList').innerHTML = orders.map((order) => {
      const itemsPreview = order.items.slice(0, 3).map((item) => `
        <img src="${item.image}" alt="${item.name}" width="36" height="36" title="${item.name}">
      `).join('');
      const more = order.items.length > 3 ? `<span class="orders-list__more">+${order.items.length - 3}</span>` : '';

      const confirmBtn = order.status === 'payment_processing'
        ? `<button type="button" class="btn btn--sm btn--primary" data-confirm="${order.id}">Confirm payment</button>`
        : '';

      return `
        <article class="order-card">
          <div class="order-card__header">
            <div>
              <strong>${order.id}</strong>
              <span class="order-card__date">${formatDate(order.createdAt)}</span>
            </div>
            <span class="status-badge ${statusClass(order.status)}">${order.statusLabel}</span>
          </div>
          <div class="order-card__meta">
            <span>${order.paymentMethodLabel}</span>
            <span>${order.deliveryDistrict}</span>
            <strong>${formatPrice(order.totalAmount)}</strong>
          </div>
          <div class="order-card__items">${itemsPreview}${more}</div>
          <ul class="order-card__item-list">
            ${order.items.map((item) => `
              <li>${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}</li>
            `).join('')}
          </ul>
          ${order.paymentReference ? `<p class="order-card__ref">Ref: ${order.paymentReference}</p>` : ''}
          <div class="order-card__actions">${confirmBtn}</div>
        </article>
      `;
    }).join('');

    $('#ordersList').querySelectorAll('[data-confirm]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        const result = await OrderStore.confirmPayment(btn.dataset.confirm, session);
        btn.disabled = false;
        if (!result.ok) {
          showToast(result.error);
          return;
        }
        showToast('Payment confirmed!');
        loadOrders();
      });
    });
  }

  async function loadOrders() {
    const result = await OrderStore.list(session);
    if (!result.ok) {
      showToast(result.error);
      return;
    }

    if (session.role === 'admin') {
      $('#ordersSubtitle').textContent = 'All platform orders (admin view)';
    }

    renderOrders(result.orders);
  }

  loadOrders();
})();
