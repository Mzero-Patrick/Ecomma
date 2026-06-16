(function () {
  'use strict';

  const cart = JSON.parse(localStorage.getItem('ecomma_cart') || '[]');
  const wishlist = JSON.parse(localStorage.getItem('ecomma_wishlist') || '[]');

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function formatPrice(amount) {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function saveCart() {
    localStorage.setItem('ecomma_cart', JSON.stringify(cart));
    updateBadges();
    renderCart();
  }

  function saveWishlist() {
    localStorage.setItem('ecomma_wishlist', JSON.stringify(wishlist));
    updateBadges();
    renderWishlist();
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function updateBadges() {
    $('#cartCount').textContent = cart.length;
    $('#wishlistCount').textContent = wishlist.length;
    $('#checkoutBtn').disabled = cart.length === 0;
  }

  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function updateAuthUI() {
    const session = Auth.getSession();
    const topBar = $('#topBarAuth');
    if (!topBar) return;

    if (session) {
      const dashLink = session.role === 'admin'
        ? 'admin/dashboard.html'
        : session.role === 'seller'
          ? 'seller/dashboard.html'
          : null;

      topBar.innerHTML = `
        <span class="top-bar__user">Hi, ${session.name}</span>
        ${dashLink ? `<a href="${dashLink}">Dashboard</a>` : ''}
        <a href="#" id="logoutLink">Sign Out</a>
      `;
      $('#logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        updateAuthUI();
        showToast('Signed out successfully.');
      });
    } else {
      topBar.innerHTML = `
        <a href="#seller">Sell on Ecomma</a>
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      `;
    }
  }

  function addToCart(productId) {
    const product = getProduct(productId);
    if (!product) return;
    if (cart.find((c) => c.id === productId)) {
      showToast(`${product.name} is already in your cart`);
      return;
    }
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image });
    saveCart();
    showToast(`${product.name} added to cart`);
  }

  function addToWishlist(productId) {
    const product = getProduct(productId);
    if (!product) return;
    if (wishlist.find((w) => w.id === productId)) {
      showToast(`${product.name} is already in your wishlist`);
      return;
    }
    wishlist.push({ id: product.id, name: product.name, price: product.price, image: product.image });
    saveWishlist();
    showToast(`${product.name} added to wishlist`);
  }

  function removeFromCart(productId) {
    const idx = cart.findIndex((c) => c.id === productId);
    if (idx > -1) cart.splice(idx, 1);
    saveCart();
  }

  function removeFromWishlist(productId) {
    const idx = wishlist.findIndex((w) => w.id === productId);
    if (idx > -1) wishlist.splice(idx, 1);
    saveWishlist();
  }

  function renderCart() {
    const body = $('#cartBody');
    if (cart.length === 0) {
      body.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    body.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <img class="cart-item__thumb" src="${item.image || getProductImage(item.name)}" alt="${item.name}" width="48" height="48">
        <div class="cart-item__details">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
        </div>
        <button type="button" data-remove-cart="${item.id}">Remove</button>
      </div>
    `).join('') + `<div class="cart-total"><span>Total</span><span>${formatPrice(total)}</span></div>`;

    body.querySelectorAll('[data-remove-cart]').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.removeCart)));
    });
  }

  function renderWishlist() {
    const body = $('#wishlistBody');
    if (wishlist.length === 0) {
      body.innerHTML = '<p class="empty-state">Your wishlist is empty.</p>';
      return;
    }
    body.innerHTML = wishlist.map((item) => `
      <div class="cart-item">
        <img class="cart-item__thumb" src="${item.image || getProductImage(item.name)}" alt="${item.name}" width="48" height="48">
        <div class="cart-item__details">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
        </div>
        <button type="button" data-remove-wishlist="${item.id}">Remove</button>
      </div>
    `).join('');

    body.querySelectorAll('[data-remove-wishlist]').forEach((btn) => {
      btn.addEventListener('click', () => removeFromWishlist(Number(btn.dataset.removeWishlist)));
    });
  }

  function renderCategoryFilters() {
    const container = $('#categoryFilters');
    container.querySelectorAll('.filter-btn[data-filter]:not([data-filter="all"])').forEach((btn) => btn.remove());

    CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat.id;
      btn.setAttribute('role', 'tab');
      btn.textContent = `${cat.icon} ${cat.name}`;
      container.appendChild(btn);
    });
  }

  function renderCategories(filter = 'all') {
    const grid = $('#categoryGrid');
    const filtered = filter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.id === filter);

    grid.innerHTML = filtered.map((cat) => {
      const itemsHtml = cat.items.map((itemName) => {
        const product = PRODUCTS.find(
          (p) => p.category === cat.id && p.name.toLowerCase() === itemName.toLowerCase()
        );
        const image = getProductImage(itemName, cat.id);
        const priceLabel = product ? `${formatPrice(product.price)} · ⭐ ${product.rating}` : 'Available now';
        const productId = product?.id ?? '';

        return `
          <div class="product-mini" ${productId ? `data-product-id="${productId}"` : ''}>
            <img class="product-mini__thumb" src="${image}" alt="${itemName}" width="60" height="60" loading="lazy">
            <div class="product-mini__info">
              <div class="product-mini__name">${itemName}</div>
              <div class="product-mini__price">${priceLabel}</div>
            </div>
            <div class="product-mini__actions">
              ${productId ? `
                <button type="button" title="Add to wishlist" data-wishlist="${productId}">♡</button>
                <button type="button" title="Add to cart" data-cart="${productId}">+</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      return `
        <article class="category-card open" data-category="${cat.id}">
          <div class="category-card__header">
            <div class="category-card__icon" style="background:${cat.color}22">${cat.icon}</div>
            <h3>${cat.name}</h3>
            <span class="category-card__count">${cat.items.length} items</span>
            <button class="category-card__toggle" aria-label="Toggle ${cat.name}">▼</button>
          </div>
          <div class="category-card__body">
            <div class="category-card__items">${itemsHtml}</div>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.category-card__header').forEach((header) => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('[data-cart], [data-wishlist]')) return;
        header.parentElement.classList.toggle('open');
      });
    });

    grid.querySelectorAll('[data-cart]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(Number(btn.dataset.cart));
      });
    });

    grid.querySelectorAll('[data-wishlist]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToWishlist(Number(btn.dataset.wishlist));
      });
    });
  }

  function handleSearch(query) {
    const q = query.trim().toLowerCase();
    const resultsEl = $('#searchResults');
    const listEl = $('#searchResultsList');

    if (!q) {
      resultsEl.hidden = true;
      $('#categoryGrid').style.display = '';
      return;
    }

    const results = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
    );

    $('#categoryGrid').style.display = 'none';
    resultsEl.hidden = false;

    if (results.length === 0) {
      listEl.innerHTML = '<p class="empty-state">No products found. Try a different search.</p>';
      return;
    }

    listEl.innerHTML = results.map((p) => `
      <div class="search-result-item">
        <div class="search-result-item__main">
          <img class="search-result-item__thumb" src="${p.image}" alt="${p.name}" width="52" height="52" loading="lazy">
          <div>
            <strong>${p.name}</strong>
            <div style="font-size:0.8rem;color:var(--color-text-muted)">${p.categoryName} · ${p.seller} · ⭐ ${p.rating}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="font-weight:600;color:var(--color-primary)">${formatPrice(p.price)}</span>
          <button class="btn btn--sm btn--outline" data-wishlist="${p.id}">♡</button>
          <button class="btn btn--sm btn--primary" data-cart="${p.id}">Add</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-cart]').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(Number(btn.dataset.cart)));
    });
    listEl.querySelectorAll('[data-wishlist]').forEach((btn) => {
      btn.addEventListener('click', () => addToWishlist(Number(btn.dataset.wishlist)));
    });
  }

  function openModal(id) {
    const modal = $(`#${id}`);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    $$('.modal.open').forEach(closeModal);
  }

  function setupModals() {
    $('#cartBtn').addEventListener('click', () => openModal('cartModal'));
    $('#wishlistBtn').addEventListener('click', () => openModal('wishlistModal'));

    $$('[data-close]').forEach((el) => {
      el.addEventListener('click', () => closeModal(el.closest('.modal')));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });

    $$('[data-modal]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const type = el.dataset.modal;
        openAuthModal(type === 'register');
      });
    });

    document.querySelectorAll('input[name="authRole"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const isSeller = document.querySelector('input[name="authRole"]:checked')?.value === 'seller';
        const isRegister = $('#authSubmit').textContent === 'Create Account';
        $('#sellerField').hidden = !isRegister || !isSeller;
        $('#shopName').required = isRegister && isSeller;
      });
    });

    $('#authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const isRegister = $('#authSubmit').textContent === 'Create Account';
      const email = $('#authEmail').value;
      const password = $('#authPassword').value;
      const role = document.querySelector('input[name="authRole"]:checked')?.value || 'user';
      const submitBtn = $('#authSubmit');
      submitBtn.disabled = true;

      if (isRegister) {
        const result = await Auth.register({
          name: $('#authName').value,
          email,
          password,
          role,
          shopName: $('#shopName').value
        });
        submitBtn.disabled = false;
        if (!result.ok) {
          showToast(result.error);
          return;
        }
        closeModal($('#authModal'));
        showToast('Account created! Welcome to Ecomma.');
        updateAuthUI();
        if (result.user.role !== 'user') {
          setTimeout(() => { window.location.href = Auth.redirectForRole(result.user.role); }, 800);
        }
      } else {
        const result = await Auth.login(email, password);
        submitBtn.disabled = false;
        if (!result.ok) {
          showToast(result.error);
          return;
        }
        if (role === 'seller' && result.user.role !== 'seller' && result.user.role !== 'admin') {
          Auth.logout();
          showToast('This account is not registered as a seller.');
          return;
        }
        closeModal($('#authModal'));
        showToast(`Welcome back, ${result.user.name}!`);
        updateAuthUI();
        if (result.user.role === 'seller' || result.user.role === 'admin') {
          setTimeout(() => { window.location.href = Auth.redirectForRole(result.user.role); }, 800);
        }
      }
      e.target.reset();
    });

    $('#checkoutBtn').addEventListener('click', () => {
      closeModal($('#cartModal'));
      showToast('Checkout coming soon — MTN MoMo, Airtel Money & COD supported.');
    });
  }

  function openAuthModal(isRegister) {
    $('#authTitle').textContent = isRegister ? 'Register' : 'Login';
    $('#authSubmit').textContent = isRegister ? 'Create Account' : 'Login';
    $('#authNameField').hidden = !isRegister;
    $('#authRoleSelector').hidden = false;
    const isSeller = document.querySelector('input[name="authRole"]:checked')?.value === 'seller';
    $('#sellerField').hidden = !isRegister || !isSeller;
    $('#authSwitch').innerHTML = isRegister
      ? 'Already have an account? <a href="login.html">Login</a>'
      : 'Don\'t have an account? <a href="register.html">Register</a>';
    openModal('authModal');
  }

  function setupFilters() {
    $('#categoryFilters').addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      $$('.filter-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      $('#searchResults').hidden = true;
      $('#searchInput').value = '';
      $('#categoryGrid').style.display = '';
      renderCategories(btn.dataset.filter);
    });
  }

  function setupHowTabs() {
    $$('.how-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.how-tab').forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        $$('.how-panel').forEach((p) => {
          p.classList.remove('active');
          p.hidden = true;
        });
        const panel = $(`#how-panel-${tab.dataset.howTab}`);
        panel.classList.add('active');
        panel.hidden = false;
      });
    });
  }

  function setupMobileNav() {
    const toggle = $('#menuToggle');
    const nav = $('#mobileNav');

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open);
      nav.setAttribute('aria-hidden', !open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupSearch() {
    $('#searchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      handleSearch($('#searchInput').value);
      document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    });

    $('#searchInput').addEventListener('input', (e) => {
      if (!e.target.value) handleSearch('');
    });
  }

  function setupContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const reason = $('#contactReason').options[$('#contactReason').selectedIndex].text;
      closeAllModals();
      showToast(`Thanks! Your message about "${reason}" has been sent. We'll reply soon.`);
      form.reset();
    });
  }

  function setupBusinessMap() {
    const mapFrame = $('#businessMap');
    const directionsBtn = $('#getDirectionsBtn');
    const addressEl = $('#businessAddress');

    if (!mapFrame || !directionsBtn || typeof SITE_CONFIG === 'undefined') return;

    mapFrame.src = SITE_CONFIG.mapsEmbedUrl;
    directionsBtn.href = SITE_CONFIG.mapsDirectionsUrl;
    addressEl.textContent = SITE_CONFIG.businessAddress;
  }

  async function init() {
    await ProductStore.syncGlobalProducts();
    renderCategoryFilters();
    renderCategories();
    renderCart();
    renderWishlist();
    updateBadges();
    updateAuthUI();
    setupModals();
    setupFilters();
    setupHowTabs();
    setupMobileNav();
    setupSearch();
    setupContactForm();
    setupBusinessMap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
