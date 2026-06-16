require('dotenv').config();

const PAYMENT_DEMO_MODE = process.env.PAYMENT_DEMO_MODE !== 'false';

const RW_PHONE = /^(\+?250|0)?7[2389]\d{7}$/;

function normalizeRwPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('250') && digits.length === 12) return digits;
  if (digits.startsWith('07') && digits.length === 10) return `250${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 9) return `250${digits}`;
  return digits;
}

function formatPhoneDisplay(phone) {
  const n = normalizeRwPhone(phone);
  if (n.length === 12 && n.startsWith('250')) {
    return `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
  }
  return phone;
}

function validateRwMobile(phone) {
  const normalized = normalizeRwPhone(phone);
  return /^2507[2389]\d{7}$/.test(normalized);
}

function generateReference(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function initiateMtnMomo({ orderId, phone, amount }) {
  const reference = generateReference('MTN');
  const displayPhone = formatPhoneDisplay(phone);

  return {
    ok: true,
    provider: 'mtn_momo',
    reference,
    status: 'processing',
    demoMode: PAYMENT_DEMO_MODE,
    instructions: PAYMENT_DEMO_MODE
      ? `[Demo] MTN MoMo request sent to ${displayPhone}. Approve RF ${amount.toLocaleString()} on your phone, then click "Confirm Payment" below.`
      : `MTN MoMo payment request sent to ${displayPhone}. Enter your PIN on your phone to approve RF ${amount.toLocaleString()}.`,
    ussdHint: '*182*7*1#',
    orderId
  };
}

function initiateAirtelMoney({ orderId, phone, amount }) {
  const reference = generateReference('ATL');
  const displayPhone = formatPhoneDisplay(phone);

  return {
    ok: true,
    provider: 'airtel_money',
    reference,
    status: 'processing',
    demoMode: PAYMENT_DEMO_MODE,
    instructions: PAYMENT_DEMO_MODE
      ? `[Demo] Airtel Money request sent to ${displayPhone}. Approve RF ${amount.toLocaleString()} on your phone, then click "Confirm Payment" below.`
      : `Airtel Money payment request sent to ${displayPhone}. Approve RF ${amount.toLocaleString()} on your Airtel app or USSD.`,
    ussdHint: '*500#',
    orderId
  };
}

function initiateCod({ orderId, amount }) {
  return {
    ok: true,
    provider: 'cod',
    reference: generateReference('COD'),
    status: 'completed',
    demoMode: PAYMENT_DEMO_MODE,
    instructions: `Cash on delivery selected. Pay RF ${amount.toLocaleString()} when your order arrives.`,
    orderId
  };
}

function initiatePayment({ method, orderId, phone, amount }) {
  if (method === 'mtn_momo') {
    if (!validateRwMobile(phone)) {
      return { ok: false, error: 'Enter a valid MTN Rwanda number (e.g. 078XXXXXXX).' };
    }
    return initiateMtnMomo({ orderId, phone, amount });
  }

  if (method === 'airtel_money') {
    if (!validateRwMobile(phone)) {
      return { ok: false, error: 'Enter a valid Airtel Rwanda number (e.g. 073XXXXXXX).' };
    }
    return initiateAirtelMoney({ orderId, phone, amount });
  }

  if (method === 'cod') {
    return initiateCod({ orderId, amount });
  }

  return { ok: false, error: 'Unsupported payment method.' };
}

function verifyDemoPayment({ method, reference }) {
  if (!reference) {
    return { ok: false, error: 'Payment reference is missing.' };
  }

  if (method === 'cod') {
    return { ok: true, status: 'completed', message: 'Cash on delivery order confirmed.' };
  }

  if (!PAYMENT_DEMO_MODE) {
    return {
      ok: false,
      error: 'Live payment verification is not configured. Set PAYMENT_DEMO_MODE=true for local testing.'
    };
  }

  return {
    ok: true,
    status: 'completed',
    message: method === 'mtn_momo'
      ? 'MTN MoMo payment confirmed successfully.'
      : 'Airtel Money payment confirmed successfully.'
  };
}

module.exports = {
  initiatePayment,
  verifyDemoPayment,
  normalizeRwPhone,
  validateRwMobile,
  formatPhoneDisplay,
  PAYMENT_DEMO_MODE
};
