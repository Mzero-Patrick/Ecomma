const express = require('express');
const { query } = require('../db');
const {
  initiatePayment,
  verifyDemoPayment,
  normalizeRwPhone
} = require('../services/payments');

const router = express.Router();

const STATUS_LABELS = {
  pending_payment: 'Awaiting payment',
  payment_processing: 'Payment processing',
  paid: 'Paid',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  payment_failed: 'Payment failed'
};

const PAYMENT_LABELS = {
  mtn_momo: 'MTN MoMo',
  airtel_money: 'Airtel Money',
  cod: 'Cash on Delivery'
};

function mapOrderItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.product_name,
    image: row.product_image,
    seller: row.seller_name,
    price: row.price,
    quantity: row.quantity
  };
}

function mapOrder(row, items = []) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] || row.status,
    paymentMethod: row.payment_method,
    paymentMethodLabel: PAYMENT_LABELS[row.payment_method] || row.payment_method,
    paymentStatus: row.payment_status,
    paymentReference: row.payment_reference,
    paymentPhone: row.payment_phone,
    totalAmount: row.total_amount,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryDistrict: row.delivery_district,
    deliveryAddress: row.delivery_address,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map(mapOrderItem)
  };
}

async function getOrderItems(orderId) {
  const rows = await query(
    `SELECT id, order_id, product_id, product_name, product_image, seller_name, price, quantity
     FROM order_items WHERE order_id = ? ORDER BY id ASC`,
    [orderId]
  );
  return rows;
}

async function getOrderById(orderId) {
  const rows = await query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);
  if (!rows.length) return null;
  const items = await getOrderItems(orderId);
  return mapOrder(rows[0], items);
}

function requireSession(body) {
  const session = body?.session;
  if (!session?.id) {
    return { ok: false, status: 401, error: 'You must be signed in to place an order.' };
  }
  return { ok: true, session };
}

router.post('/', async (req, res) => {
  try {
    const auth = requireSession(req.body);
    if (!auth.ok) return res.status(auth.status).json(auth);

    const { session, items, paymentMethod, customerName, customerPhone, deliveryDistrict, deliveryAddress, notes, paymentPhone } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Your cart is empty.' });
    }

    const method = paymentMethod;
    if (!['mtn_momo', 'airtel_money', 'cod'].includes(method)) {
      return res.status(400).json({ ok: false, error: 'Select MTN MoMo, Airtel Money, or Cash on Delivery.' });
    }

    if (!customerName?.trim() || !customerPhone?.trim() || !deliveryDistrict?.trim() || !deliveryAddress?.trim()) {
      return res.status(400).json({ ok: false, error: 'Please fill in delivery details.' });
    }

    const momoPhone = method === 'cod' ? customerPhone : (paymentPhone || customerPhone);
    if (method !== 'cod' && !momoPhone?.trim()) {
      return res.status(400).json({ ok: false, error: 'Enter the mobile money number for payment.' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productRows = await query(
        `SELECT id, name, image, price, seller, is_deleted FROM products WHERE id = ? LIMIT 1`,
        [item.productId]
      );

      if (!productRows.length || productRows[0].is_deleted) {
        return res.status(400).json({ ok: false, error: `Product #${item.productId} is no longer available.` });
      }

      const product = productRows[0];
      const qty = Math.max(1, Number(item.quantity) || 1);
      totalAmount += product.price * qty;
      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        seller: product.seller,
        price: product.price,
        quantity: qty
      });
    }

    const orderId = `ord-${Date.now()}`;
    const now = Date.now();
    let status = 'pending_payment';
    let paymentStatus = 'pending';
    let paymentReference = null;
    let normalizedPaymentPhone = null;

    if (method === 'cod') {
      status = 'confirmed';
      paymentStatus = 'not_required';
    }

    await query(
      `INSERT INTO orders
        (id, user_id, status, payment_method, payment_status, payment_reference, payment_phone,
         total_amount, customer_name, customer_email, customer_phone, delivery_district,
         delivery_address, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        session.id,
        status,
        method,
        paymentStatus,
        paymentReference,
        normalizedPaymentPhone,
        totalAmount,
        customerName.trim(),
        session.email,
        customerPhone.trim(),
        deliveryDistrict.trim(),
        deliveryAddress.trim(),
        notes?.trim() || null,
        now,
        now
      ]
    );

    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, product_image, seller_name, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.image, item.seller, item.price, item.quantity]
      );
    }

    let payment = null;

    if (method === 'cod') {
      payment = initiatePayment({ method, orderId, phone: customerPhone, amount: totalAmount });
      paymentReference = payment.reference;
      await query(
        'UPDATE orders SET payment_reference = ?, updated_at = ? WHERE id = ?',
        [paymentReference, Date.now(), orderId]
      );
    } else {
      payment = initiatePayment({
        method,
        orderId,
        phone: momoPhone,
        amount: totalAmount
      });

      if (!payment.ok) {
        await query('UPDATE orders SET status = ?, payment_status = ?, updated_at = ? WHERE id = ?', [
          'payment_failed', 'failed', Date.now(), orderId
        ]);
        return res.status(400).json(payment);
      }

      paymentReference = payment.reference;
      normalizedPaymentPhone = normalizeRwPhone(momoPhone);

      await query(
        `UPDATE orders
         SET status = 'payment_processing', payment_status = 'processing',
             payment_reference = ?, payment_phone = ?, updated_at = ?
         WHERE id = ?`,
        [paymentReference, normalizedPaymentPhone, Date.now(), orderId]
      );
    }

    const order = await getOrderById(orderId);

    res.status(201).json({
      ok: true,
      order,
      payment: {
        ...payment,
        amount: totalAmount
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ ok: false, error: 'Could not create order. Please try again.' });
  }
});

router.post('/:id/confirm-payment', async (req, res) => {
  try {
    const auth = requireSession(req.body);
    if (!auth.ok) return res.status(auth.status).json(auth);

    const orderId = req.params.id;
    const orderRows = await query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]);

    if (!orderRows.length) {
      return res.status(404).json({ ok: false, error: 'Order not found.' });
    }

    const order = orderRows[0];

    if (order.user_id !== auth.session.id && auth.session.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'You cannot confirm this payment.' });
    }

    if (order.payment_method === 'cod') {
      return res.status(400).json({ ok: false, error: 'Cash on delivery orders do not require payment confirmation.' });
    }

    if (order.payment_status === 'completed') {
      return res.json({ ok: true, order: await getOrderById(orderId), message: 'Payment already confirmed.' });
    }

    const result = verifyDemoPayment({
      method: order.payment_method,
      reference: order.payment_reference
    });

    if (!result.ok) {
      return res.status(400).json(result);
    }

    const now = Date.now();
    await query(
      `UPDATE orders
       SET status = 'confirmed', payment_status = 'completed', updated_at = ?
       WHERE id = ?`,
      [now, orderId]
    );

    res.json({
      ok: true,
      message: result.message,
      order: await getOrderById(orderId)
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ ok: false, error: 'Payment confirmation failed.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const session = req.query.session ? JSON.parse(req.query.session) : null;
    if (!session?.id) {
      return res.status(401).json({ ok: false, error: 'Sign in to view orders.' });
    }

    let rows;
    if (session.role === 'admin') {
      rows = await query('SELECT * FROM orders ORDER BY created_at DESC');
    } else {
      rows = await query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [session.id]
      );
    }

    const orders = [];
    for (const row of rows) {
      const items = await getOrderItems(row.id);
      orders.push(mapOrder(row, items));
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ ok: false, error: 'Could not load orders.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = req.query.session ? JSON.parse(req.query.session) : null;
    if (!session?.id) {
      return res.status(401).json({ ok: false, error: 'Sign in to view this order.' });
    }

    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Order not found.' });
    }

    if (order.userId !== session.id && session.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Access denied.' });
    }

    res.json({ ok: true, order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ ok: false, error: 'Could not load order.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { session, status } = req.body;

    if (!session?.id || session.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Only administrators can update order status.' });
    }

    const allowed = ['confirmed', 'shipped', 'delivered', 'cancelled', 'payment_failed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status.' });
    }

    const orderRows = await query('SELECT id FROM orders WHERE id = ? LIMIT 1', [req.params.id]);
    if (!orderRows.length) {
      return res.status(404).json({ ok: false, error: 'Order not found.' });
    }

    await query('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [
      status, Date.now(), req.params.id
    ]);

    res.json({ ok: true, order: await getOrderById(req.params.id) });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ ok: false, error: 'Could not update order status.' });
  }
});

module.exports = router;
