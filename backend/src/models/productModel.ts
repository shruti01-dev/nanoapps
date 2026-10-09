import { pool } from '../config/db';

export const createProductsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(150) UNIQUE NOT NULL,
      description TEXT,
      type VARCHAR(20) NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      pricing_model VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS free_download_url TEXT`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS windows_download_url TEXT`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS mac_download_url TEXT`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline TEXT`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS razorpay_plan_id VARCHAR(100)`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly'`);
};

export const createProductFilesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_files (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      platform VARCHAR(20) NOT NULL,
      version VARCHAR(20) NOT NULL,
      storage_path VARCHAR(255) NOT NULL,
      uploaded_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE product_files ALTER COLUMN storage_path TYPE TEXT`);
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  tagline: string;
  features: string;
  type: string;
  price: number;
  pricing_model: string;
  is_free: boolean;
  free_download_url: string | null;
  windows_download_url: string | null;
  mac_download_url: string | null;
  razorpay_plan_id: string | null;
  billing_period: string;
};

export const getAllProducts = async (type?: string, includeInactive = false) => {
  const filters = includeInactive ? [] : ['is_active = TRUE'];
  const params: string[] = [];
  if (type) {
    params.push(type);
    filters.push(`type = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM products ${where} ORDER BY created_at DESC`,
    params
  );
  return result.rows;
};

export const getProductPlatforms = async (productId: number) => {
  const [files, product] = await Promise.all([
    pool.query('SELECT DISTINCT platform FROM product_files WHERE product_id = $1', [productId]),
    pool.query(
      'SELECT windows_download_url, mac_download_url, free_download_url FROM products WHERE id = $1',
      [productId]
    ),
  ]);

  const platforms = new Set(files.rows.map((row) => row.platform as string));
  const row = product.rows[0];
  if (row?.windows_download_url) platforms.add('windows');
  if (row?.mac_download_url) platforms.add('mac');
  if (row?.free_download_url) {
    if (!row.windows_download_url) platforms.add('windows');
    if (!row.mac_download_url) platforms.add('mac');
  }

  return ['windows', 'mac', 'web'].filter((platform) => platforms.has(platform));
};

export const createProduct = async (data: ProductInput) => {
  const result = await pool.query(
    `INSERT INTO products
      (name, slug, description, tagline, features, type, price, pricing_model, is_free, free_download_url, windows_download_url, mac_download_url, razorpay_plan_id, billing_period)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
    [
      data.name,
      data.slug,
      data.description,
      data.tagline,
      data.features,
      data.type,
      data.price,
      data.pricing_model,
      data.is_free,
      data.free_download_url,
      data.windows_download_url,
      data.mac_download_url,
      data.razorpay_plan_id,
      data.billing_period,
    ]
  );
  return result.rows[0];
};

export const updateProduct = async (productId: number, data: ProductInput & { is_active: boolean }) => {
  const result = await pool.query(
    `UPDATE products SET
      name = $1, slug = $2, description = $3, tagline = $4, features = $5, type = $6, price = $7, pricing_model = $8,
      is_free = $9, free_download_url = $10, windows_download_url = $11, mac_download_url = $12,
      razorpay_plan_id = $13, billing_period = $14, is_active = $15
     WHERE id = $16 RETURNING *`,
    [
      data.name,
      data.slug,
      data.description,
      data.tagline,
      data.features,
      data.type,
      data.price,
      data.pricing_model,
      data.is_free,
      data.free_download_url,
      data.windows_download_url,
      data.mac_download_url,
      data.razorpay_plan_id,
      data.billing_period,
      data.is_active,
      productId,
    ]
  );
  return result.rows[0];
};

export const addProductFile = async (data: {
  product_id: number;
  platform: string;
  version: string;
  storage_path: string;
}) => {
  const result = await pool.query(
    `INSERT INTO product_files (product_id, platform, version, storage_path)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.product_id, data.platform, data.version, data.storage_path]
  );
  return result.rows[0];
};

export const getLatestProductFile = async (productId: number, platform: string) => {
  const result = await pool.query(
    `SELECT * FROM product_files WHERE product_id = $1 AND platform = $2
     ORDER BY uploaded_at DESC LIMIT 1`,
    [productId, platform]
  );
  return result.rows[0];
};

export const getProductById = async (productId: number) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
  return result.rows[0];
};

export const deleteProductById = async (productId: number) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id, name, slug', [productId]);
  return result.rows[0];
};

export const getProductBySlug = async (slug: string) => {
  const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
  return result.rows[0];
};

const builtinTools = [
  {
    name: 'Focus Timer',
    slug: 'focus-timer',
    description: 'One task. One timer. A little more focus.',
  },
  {
    name: 'Bill Splitter',
    slug: 'bill-splitter',
    description: 'Split a meal, a trip, or a shared bill fairly.',
  },
  {
    name: 'Breathing Break',
    slug: 'breathing-break',
    description: 'Take a moment. Follow a calmer rhythm.',
  },
  {
    name: 'Unit Converter',
    slug: 'unit-converter',
    description: 'From metres to miles, without the mental maths.',
  },
];

export const ensureBuiltinTools = async () => {
  for (const tool of builtinTools) {
    await pool.query(
      `INSERT INTO products
        (name, slug, description, tagline, features, type, price, pricing_model, is_free, billing_period, is_active)
       VALUES ($1, $2, $3, '', '', 'web', 0, 'one_time', TRUE, 'monthly', TRUE)
       ON CONFLICT (slug) DO NOTHING`,
      [tool.name, tool.slug, tool.description]
    );
  }
};
