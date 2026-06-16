(function () {
  'use strict';

  const session = Auth.requireRole(['seller'], '../login.html');
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
    $('#shopLabel').textContent = session.shopName || 'Seller';
    $('#userAvatar').textContent = (session.shopName || session.name).charAt(0).toUpperCase();
    $('#sellerWelcome').textContent = `Welcome, ${session.name}`;
    $('#statShop').textContent = session.shopName || '—';
    $('#statEmail').textContent = session.email;
  }

  async function renderProducts() {
    const products = await ProductStore.getBySeller(session.id);
    $('#statProducts').textContent = products.length;

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
        <td>${formatPrice(p.price)}</td>
        <td><span class="status-badge status-badge--live">Live</span></td>
      </tr>
    `).join('');
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
      });
    });

    $$('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.goto;
        document.querySelector(`[data-panel="${target}"]`)?.click();
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
      image: $('#productImage').value
    }, session);

    submitBtn.disabled = false;

    if (!result.ok) {
      showToast(result.error);
      return;
    }

    showToast(`"${result.product.name}" is now live on Ecomma!`);
    e.target.reset();
    await renderProducts();
    document.querySelector('[data-panel="my-products"]')?.click();
  });

  async function init() {
    populateCategories();
    renderUserInfo();
    await renderProducts();
    setupNav();
  }

  init();
})();
