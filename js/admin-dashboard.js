(function () {
  'use strict';

  const session = Auth.requireRole(['admin'], '../login.html');
  if (!session) return;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function formatPrice(amount) {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function populateCategories() {
    const select = $('#productCategory');
    select.innerHTML = CATEGORIES.map((c) =>
      `<option value="${c.id}">${c.icon} ${c.name}</option>`
    ).join('');
  }

  function renderUserInfo() {
    $('#userName').textContent = session.name;
    $('#userAvatar').textContent = session.name.charAt(0).toUpperCase();
    $('#adminWelcome').textContent = `Signed in as ${session.email}`;
    $('#statCategories').textContent = CATEGORIES.length;
  }

  function renderProducts() {
    const products = ProductStore.getAll();
    const sellerCount = products.filter((p) => p.addedBy === 'seller').length;

    $('#statTotal').textContent = products.length;
    $('#statSeller').textContent = sellerCount;

    const tbody = $('#productsTableBody');
    const empty = $('#emptyProducts');

    if (products.length === 0) {
      tbody.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    tbody.innerHTML = products.map((p) => `
      <tr>
        <td>
          <div class="table-product">
            <img src="${p.image}" alt="${p.name}" width="40" height="40">
            <span>${p.name}</span>
          </div>
        </td>
        <td>${p.categoryName}</td>
        <td>${p.seller}</td>
        <td>${formatPrice(p.price)}</td>
        <td>
          <button type="button" class="btn btn--sm btn--danger" data-remove="${p.id}">Remove</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.remove);
        if (!confirm('Remove this product from the marketplace?')) return;

        btn.disabled = true;
        const result = await ProductStore.removeProduct(id, session);
        btn.disabled = false;

        if (!result.ok) {
          showToast(result.error);
          return;
        }

        showToast('Product removed from marketplace.');
        renderProducts();
      });
    });
  }

  function setupNav() {
    $$('.dashboard-nav__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const panel = link.dataset.panel;
        $$('.dashboard-nav__link').forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
        $$('.dashboard-panel').forEach((p) => {
          p.hidden = !p.id.endsWith(panel);
          p.classList.toggle('active', p.id.endsWith(panel));
        });
        if (panel === 'orders') renderOrders();
      });
    });
  }

  async function renderOrders() {
    const result = await OrderStore.list(session);
    const tbody = $('#ordersTableBody');
    const empty = $('#emptyOrders');

    if (!result.ok) {
      showToast(result.error);
      return;
    }

    $('#statOrders').textContent = result.orders.length;

    if (!result.orders.length) {
      tbody.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    tbody.innerHTML = result.orders.map((order) => `
      <tr>
        <td>
          <strong>${order.id}</strong><br>
          <small>${new Date(order.createdAt).toLocaleDateString('en-RW')}</small>
        </td>
        <td>${order.customerName}<br><small>${order.deliveryDistrict}</small></td>
        <td>${order.paymentMethodLabel}</td>
        <td>${formatPrice(order.totalAmount)}</td>
        <td><span class="status-badge status-badge--pending">${order.statusLabel}</span></td>
        <td>
          <select class="order-status-select" data-order="${order.id}">
            <option value="">Update…</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.order-status-select').forEach((select) => {
      select.addEventListener('change', async () => {
        const status = select.value;
        if (!status) return;
        const orderId = select.dataset.order;
        select.disabled = true;
        const res = await OrderStore.updateStatus(orderId, status, session);
        select.disabled = false;
        select.value = '';
        if (!res.ok) {
          showToast(res.error);
          return;
        }
        showToast(`Order ${orderId} → ${status}`);
        renderOrders();
      });
    });
  }

  $('#logoutBtn').addEventListener('click', () => {
    Auth.logout();
    window.location.href = '../login.html';
  });

  $('#addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const result = await ProductStore.addProduct({
      name: $('#productName').value,
      category: $('#productCategory').value,
      price: $('#productPrice').value,
      seller: $('#productSeller').value,
      image: $('#productImage').value
    }, session);

    submitBtn.disabled = false;

    if (!result.ok) {
      showToast(result.error);
      return;
    }

    showToast(`"${result.product.name}" published successfully.`);
    e.target.reset();
    renderProducts();
    document.querySelector('[data-panel="all-products"]')?.click();
  });

  async function init() {
    await ProductStore.syncGlobalProducts();
    populateCategories();
    renderUserInfo();
    renderProducts();
    await renderOrders();
    setupNav();
  }

  init();
})();
