import { pool } from '../config/db';
import { getProductById } from './productModel';

export const createOrdersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'paid',
      razorpay_payment_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      status VARCHAR(30) DEFAULT 'created',
      razorpay_subscription_id VARCHAR(255),
      current_period_end TIMESTAMP,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS licenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      license_key VARCHAR(64) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, product_id)
    );
  `);
};

export const createOrder = async (data: {
  user_id: number;
  product_id: number;
  amount: number;
  status?: string;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
}) => {
  const result = await pool.query(
    `INSERT INTO orders (user_id, product_id, amount, status, razorpay_payment_id, razorpay_order_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.user_id,
      data.product_id,
      data.amount,
      data.status || 'paid',
      data.razorpay_payment_id || null,
      data.razorpay_order_id || null,
    ]
  );
  return result.rows[0];
};

export const attachRazorpayOrderId = async (orderId: number, razorpayOrderId: string) => {
  const result = await pool.query(
    `UPDATE orders SET razorpay_order_id = $1 WHERE id = $2 RETURNING *`,
    [razorpayOrderId, orderId]
  );
  return result.rows[0];
};

export const findOrderById = async (orderId: number) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  return result.rows[0];
};

export const findOrderByRazorpayOrderId = async (razorpayOrderId: string) => {
  const result = await pool.query('SELECT * FROM orders WHERE razorpay_order_id = $1', [razorpayOrderId]);
  return result.rows[0];
};

export const findOrderByPaymentId = async (paymentId: string) => {
  const result = await pool.query('SELECT * FROM orders WHERE razorpay_payment_id = $1', [paymentId]);
  return result.rows[0];
};

export const markOrderPaid = async (orderId: number, paymentId: string) => {
  const result = await pool.query(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = $1 WHERE id = $2 RETURNING *`,
    [paymentId, orderId]
  );
  return result.rows[0];
};

export const userOwnsProduct = async (userId: number, productId: number) => {
  const result = await pool.query(
    `SELECT id FROM orders WHERE user_id = $1 AND product_id = $2 AND status = 'paid' LIMIT 1`,
    [userId, productId]
  );
  return result.rows.length > 0;
};

const activeSubscriptionSql = `
  (
    status IN ('active', 'authenticated')
    AND (current_period_end IS NULL OR current_period_end > NOW())
  )
  OR (cancel_at_period_end = TRUE AND current_period_end > NOW())
`;

export const userHasActiveSubscription = async (userId: number, productId: number) => {
  const result = await pool.query(
    `SELECT id FROM subscriptions
     WHERE user_id = $1 AND product_id = $2 AND (${activeSubscriptionSql})
     LIMIT 1`,
    [userId, productId]
  );
  return result.rows.length > 0;
};

export const userHasAccess = async (userId: number, productId: number) => {
  const product = await getProductById(productId);
  if (!product || !product.is_active) return false;
  if (product.is_free) return true;
  if (await userOwnsProduct(userId, productId)) return true;
  return userHasActiveSubscription(userId, productId);
};

export const getUserOrders = async (userId: number) => {
  const result = await pool.query(
    `SELECT o.id, o.amount, o.status, o.razorpay_payment_id, o.created_at, p.name, p.slug, p.type
     FROM orders o
     JOIN products p ON o.product_id = p.id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const listAllOrders = async () => {
  const result = await pool.query(
    `SELECT o.id, o.amount, o.status, o.razorpay_payment_id, o.created_at,
            u.email, u.name AS user_name, p.name AS product_name
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN products p ON o.product_id = p.id
     ORDER BY o.created_at DESC
     LIMIT 200`
  );
  return result.rows;
};

export const createSubscription = async (data: {
  user_id: number;
  product_id: number;
  status: string;
  razorpay_subscription_id: string;
}) => {
  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, product_id, status, razorpay_subscription_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.user_id, data.product_id, data.status, data.razorpay_subscription_id]
  );
  return result.rows[0];
};

export const findSubscriptionById = async (id: number) => {
  const result = await pool.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
  return result.rows[0];
};

export const findSubscriptionByRazorpayId = async (razorpaySubscriptionId: string) => {
  const result = await pool.query(
    'SELECT * FROM subscriptions WHERE razorpay_subscription_id = $1 ORDER BY created_at DESC LIMIT 1',
    [razorpaySubscriptionId]
  );
  return result.rows[0];
};

export const activateSubscription = async (id: number, periodEnd: Date, status = 'active') => {
  const result = await pool.query(
    `UPDATE subscriptions
     SET status = $1, current_period_end = $2
     WHERE id = $3 RETURNING *`,
    [status, periodEnd, id]
  );
  return result.rows[0];
};

export const markSubscriptionCancelAtPeriodEnd = async (id: number, periodEnd: Date) => {
  const result = await pool.query(
    `UPDATE subscriptions
     SET cancel_at_period_end = TRUE, current_period_end = $2
     WHERE id = $1 RETURNING *`,
    [id, periodEnd]
  );
  return result.rows[0];
};

export const setSubscriptionFromProvider = async (
  id: number,
  status: string,
  periodEnd: Date | null
) => {
  const result = await pool.query(
    `UPDATE subscriptions
     SET status = $2,
         current_period_end = COALESCE($3, current_period_end),
         cancel_at_period_end = CASE WHEN $2 = 'cancelled' THEN TRUE ELSE cancel_at_period_end END
     WHERE id = $1 RETURNING *`,
    [id, status, periodEnd]
  );
  return result.rows[0];
};

export const getLicense = async (userId: number, productId: number) => {
  const result = await pool.query(
    'SELECT * FROM licenses WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return result.rows[0];
};

export const createLicense = async (userId: number, productId: number, licenseKey: string) => {
  const result = await pool.query(
    `INSERT INTO licenses (user_id, product_id, license_key)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, productId, licenseKey]
  );
  return result.rows[0];
};

export const getUserPurchases = async (userId: number) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.slug, p.type, p.pricing_model, p.price,
            o.created_at AS purchased_at,
            l.license_key,
            s.id AS subscription_id,
            s.status AS subscription_status,
            s.current_period_end,
            s.cancel_at_period_end
     FROM products p
     LEFT JOIN LATERAL (
       SELECT created_at FROM orders
       WHERE user_id = $1 AND product_id = p.id AND status = 'paid'
       ORDER BY created_at DESC LIMIT 1
     ) o ON TRUE
     LEFT JOIN licenses l ON l.user_id = $1 AND l.product_id = p.id
     LEFT JOIN LATERAL (
       SELECT * FROM subscriptions
       WHERE user_id = $1 AND product_id = p.id
       ORDER BY created_at DESC LIMIT 1
     ) s ON TRUE
     WHERE o.created_at IS NOT NULL
        OR (
          s.id IS NOT NULL AND (
            (
              s.status IN ('active', 'authenticated')
              AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
            )
            OR (s.cancel_at_period_end = TRUE AND s.current_period_end > NOW())
          )
        )
     ORDER BY COALESCE(o.created_at, s.created_at) DESC`,
    [userId]
  );
  return result.rows;
};
