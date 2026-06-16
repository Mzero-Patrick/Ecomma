(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const cart = JSON.parse(localStorage.getItem('ecomma_cart') || '[]');
  let pendingOrderId = null;
  let pendingPaymentMethod = null;

  const session = Auth.getSession();
  if (!session) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }

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
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function renderCartSummary() {
    if (cart.length === 0) {
      $('#checkoutForm').hidden = true;
      $('#checkoutEmpty').hidden = false;
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    $('#checkoutItems').innerHTML = cart.map((item) => `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}" width="48" height="48">
        <div class="checkout-item__info">
          <strong>${item.name}</strong>
          <span>${formatPrice(item.price)}</span>
        </div>
      </div>
    `).join('');
    $('#checkoutTotal').textContent = formatPrice(total);

    if (!$('#customerName').value) $('#customerName').value = session.name || '';
    if (!$('#paymentPhone').value && session.role === 'user') {
      $('#paymentPhone').placeholder = '078XXXXXXX';
    }
  }

  const PAYMENT_LOGOS = {
    mtn_momo: { src: 'images/mtn.png', alt: 'MTN MoMo' },
    airtel_money: { src: 'images/airtel.png', alt: 'Airtel Money' },
    cod: { src: '', alt: 'Cash on Delivery' }
  };

  function setPaymentLogo(method) {
    const logo = PAYMENT_LOGOS[method] || PAYMENT_LOGOS.mtn_momo;
    const iconEl = $('#paymentIcon');
    if (!iconEl || !logo.src) return;
    iconEl.src = logo.src;
    iconEl.alt = logo.alt;
  }

  function togglePaymentPhone() {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const field = $('#paymentPhoneField');
    const input = $('#paymentPhone');
    const isCod = method === 'cod';
    field.hidden = isCod;
    input.required = !isCod;
  }

  function showPaymentStep(payment, order) {
    $('#checkoutForm').hidden = true;
    $('#paymentStep').hidden = false;

    pendingOrderId = order.id;
    pendingPaymentMethod = order.paymentMethod;

    setPaymentLogo(order.paymentMethod);
    $('#paymentTitle').textContent = order.paymentMethod === 'cod'
      ? 'Order confirmed — pay on delivery'
      : 'Complete payment on your phone';
    $('#paymentInstructions').textContent = payment.instructions;
    $('#paymentReference').textContent = payment.reference || order.paymentReference || '—';

    const ussd = $('#paymentUssd');
    if (payment.ussdHint && order.paymentMethod !== 'cod') {
      ussd.hidden = false;
      ussd.textContent = `USSD: ${payment.ussdHint}`;
    } else {
      ussd.hidden = true;
    }

    $('#confirmPaymentBtn').hidden = order.paymentMethod === 'cod';
  }

  function showSuccess(order, message) {
    $('#checkoutForm').hidden = true;
    $('#paymentStep').hidden = true;
    $('#orderSuccess').hidden = false;
    $('#successMessage').textContent = message || 'Your order has been confirmed.';
    $('#successOrderId').textContent = order.id;
    localStorage.removeItem('ecomma_cart');
  }

  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      togglePaymentPhone();
      setPaymentLogo(radio.value);
    });
  });

  $('#checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#placeOrderBtn');
    btn.disabled = true;

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const result = await OrderStore.create({
      session,
      items: cart.map((item) => ({ productId: item.id, quantity: 1 })),
      paymentMethod,
      customerName: $('#customerName').value,
      customerPhone: $('#customerPhone').value,
      paymentPhone: $('#paymentPhone').value,
      deliveryDistrict: $('#deliveryDistrict').value,
      deliveryAddress: $('#deliveryAddress').value,
      notes: $('#orderNotes').value
    });

    btn.disabled = false;

    if (!result.ok) {
      showToast(result.error);
      return;
    }

    if (paymentMethod === 'cod') {
      showSuccess(result.order, result.payment.instructions);
      return;
    }

    showPaymentStep(result.payment, result.order);
    showToast('Payment request sent. Approve on your phone.');
  });

  $('#confirmPaymentBtn').addEventListener('click', async () => {
    if (!pendingOrderId) return;
    const btn = $('#confirmPaymentBtn');
    btn.disabled = true;

    const result = await OrderStore.confirmPayment(pendingOrderId, session);
    btn.disabled = false;

    if (!result.ok) {
      showToast(result.error);
      return;
    }

    showSuccess(result.order, result.message);
    showToast('Payment confirmed!');
  });

  renderCartSummary();
  togglePaymentPhone();
  setPaymentLogo(document.querySelector('input[name="paymentMethod"]:checked')?.value || 'mtn_momo');
})();
