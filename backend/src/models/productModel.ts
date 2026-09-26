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
  type: string;
  price: number;
  pricing_model: string;
  is_free: boolean;
  free_download_url: string | null;
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
  const result = await pool.query(
    'SELECT DISTINCT platform FROM product_files WHERE product_id = $1',
    [productId]
  );
  return result.rows.map((row) => row.platform as string);
};

export const createProduct = async (data: ProductInput) => {
  const result = await pool.query(
    `INSERT INTO products
      (name, slug, description, type, price, pricing_model, is_free, free_download_url, razorpay_plan_id, billing_period)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      data.name,
      data.slug,
      data.description,
      data.type,
      data.price,
      data.pricing_model,
      data.is_free,
      data.free_download_url,
      data.razorpay_plan_id,
      data.billing_period,
    ]
  );
  return result.rows[0];
};

export const updateProduct = async (productId: number, data: ProductInput & { is_active: boolean }) => {
  const result = await pool.query(
    `UPDATE products SET
      name = $1, slug = $2, description = $3, type = $4, price = $5, pricing_model = $6,
      is_free = $7, free_download_url = $8, razorpay_plan_id = $9, billing_period = $10, is_active = $11
     WHERE id = $12 RETURNING *`,
    [
      data.name,
      data.slug,
      data.description,
      data.type,
      data.price,
      data.pricing_model,
      data.is_free,
      data.free_download_url,
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

export const getProductBySlug = async (slug: string) => {
  const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
  return result.rows[0];
};

export const ensureBuiltinTools = async () => {
  const tools = [
    {
      name: 'Image Compressor',
      slug: 'image-compressor',
      description: 'Shrink image file sizes without a visible drop in quality.',
      type: 'web',
      price: 0,
      pricing_model: 'one_time',
      is_free: true,
      free_download_url: null,
      razorpay_plan_id: null,
      billing_period: 'monthly',
    },
    {
      name: 'Data Cleaner',
      slug: 'data-cleaner',
      description: 'Trim cells, drop empty rows, and remove duplicate rows from a CSV.',
      type: 'web',
      price: 0,
      pricing_model: 'one_time',
      is_free: true,
      free_download_url: null,
      razorpay_plan_id: null,
      billing_period: 'monthly',
    },
  ];

  for (const tool of tools) {
    const existing = await getProductBySlug(tool.slug);
    if (!existing) await createProduct(tool);
  }
};
