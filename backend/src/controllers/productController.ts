import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  ProductInput,
  addProductFile,
  createProduct as insertProduct,
  deleteProductById,
  getAllProducts,
  getLatestProductFile,
  getProductById,
  getProductBySlug,
  getProductPlatforms,
  updateProduct as saveProduct,
} from '../models/productModel';
import { createOrder, getLicense, getUserPurchases, userHasAccess, userOwnsProduct } from '../models/orderModel';
import { findUserByEmail } from '../models/userModel';
import { supabaseStorage } from '../config/supabaseStorage';
import { ensureLicense } from '../services/fulfillment';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

export const handleUpload = (req: AuthRequest, res: Response, next: NextFunction) => {
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'files', maxCount: 200 },
  ])(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      return res.status(400).json({ message });
    }
    next();
  });
};

const parseFeatures = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  return String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const toPublicProduct = (row: any, platforms: string[] = []) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description || '',
  tagline: row.tagline || '',
  features: parseFeatures(row.features),
  type: row.type,
  price: Number(row.price),
  pricing_model: row.pricing_model,
  billing_period: row.billing_period || 'monthly',
  is_free: Boolean(row.is_free),
  is_active: Boolean(row.is_active),
  platforms,
});

const toAdminProduct = (row: any, platforms: string[] = []) => ({
  ...toPublicProduct(row, platforms),
  free_download_url: row.free_download_url,
  windows_download_url: row.windows_download_url,
  mac_download_url: row.mac_download_url,
  razorpay_plan_id: row.razorpay_plan_id,
});

const readOptionalUrl = (body: any, existing: any, key: string) => {
  if (body[key] === undefined) return existing?.[key] ?? null;
  const value = String(body[key] || '').trim();
  return value || null;
};

const withPlatforms = async (rows: any[], asAdmin: boolean) =>
  Promise.all(
    rows.map(async (row) => {
      const platforms = await getProductPlatforms(row.id);
      return asAdmin ? toAdminProduct(row, platforms) : toPublicProduct(row, platforms);
    })
  );

const readProductInput = (body: any, existing?: any): { error?: string; value?: ProductInput } => {
  const name = String(body.name ?? existing?.name ?? '').trim();
  const slug = String(body.slug ?? existing?.slug ?? '').trim().toLowerCase();
  const description = String(body.description ?? existing?.description ?? '').trim();
  const tagline =
    body.tagline === undefined && existing
      ? String(existing.tagline || '')
      : String(body.tagline ?? '').trim();
  const features =
    body.features === undefined && existing
      ? parseFeatures(existing.features).join('\n')
      : parseFeatures(body.features).join('\n');
  const type = String(body.type ?? existing?.type ?? '');
  const pricingModel = String(body.pricing_model ?? existing?.pricing_model ?? '');
  const billingPeriod = String(body.billing_period ?? existing?.billing_period ?? 'monthly');
  const price = body.price === undefined && existing ? Number(existing.price) : Number(body.price);
  const isFree = body.is_free === undefined && existing ? Boolean(existing.is_free) : Boolean(body.is_free);
  const freeDownloadUrl = readOptionalUrl(body, existing, 'free_download_url');
  const windowsDownloadUrl = readOptionalUrl(body, existing, 'windows_download_url');
  const macDownloadUrl = readOptionalUrl(body, existing, 'mac_download_url');
  const planId =
    body.razorpay_plan_id === undefined && existing
      ? existing.razorpay_plan_id
      : body.razorpay_plan_id
        ? String(body.razorpay_plan_id).trim()
        : null;

  if (!name || !slug) return { error: 'Name and slug are required' };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: 'Slug can only use lowercase letters, numbers, and hyphens' };
  }
  if (type !== 'web' && type !== 'desktop') return { error: 'Type must be web or desktop' };
  if (pricingModel !== 'one_time' && pricingModel !== 'subscription') {
    return { error: 'Pricing model must be one_time or subscription' };
  }
  if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
    return { error: 'Billing period must be monthly or yearly' };
  }
  if (!Number.isFinite(price) || price < 0) return { error: 'Price must be zero or more' };
  if (!isFree && price < 1) return { error: 'Paid products must cost at least 1 INR' };

  return {
    value: {
      name,
      slug,
      description,
      tagline,
      features,
      type,
      price,
      pricing_model: pricingModel,
      is_free: isFree,
      free_download_url: freeDownloadUrl,
      windows_download_url: windowsDownloadUrl,
      mac_download_url: macDownloadUrl,
      razorpay_plan_id: planId,
      billing_period: billingPeriod,
    },
  };
};

const duplicateSlug = (error: any) => error?.code === '23505';

export const listProducts = async (req: AuthRequest, res: Response) => {
  try {
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    if (type && type !== 'web' && type !== 'desktop') {
      return res.status(400).json({ message: 'Type must be web or desktop' });
    }
    const includeInactive = req.query.all === 'true' && req.user?.role === 'admin';
    const rows = await getAllProducts(type, includeInactive);
    res.json(await withPlatforms(rows, includeInactive));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product || (!product.is_active && req.user?.role !== 'admin')) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const platforms = await getProductPlatforms(product.id);
    const hasAccess = req.user ? await userHasAccess(req.user.id, product.id) : false;
    const license = hasAccess && req.user ? await getLicense(req.user.id, product.id) : null;

    res.json({
      product: req.user?.role === 'admin' ? toAdminProduct(product, platforms) : toPublicProduct(product, platforms),
      hasAccess,
      licenseKey: license?.license_key || null,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = readProductInput(req.body);
    if (!parsed.value) return res.status(400).json({ message: parsed.error });
    const product = await insertProduct(parsed.value);
    const platforms = await getProductPlatforms(product.id);
    res.status(201).json(toAdminProduct(product, platforms));
  } catch (error: any) {
    if (duplicateSlug(error)) return res.status(400).json({ message: 'A product with that slug already exists' });
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const existing = await getProductById(productId);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const parsed = readProductInput(req.body, existing);
    if (!parsed.value) return res.status(400).json({ message: parsed.error });
    const isActive = req.body.is_active === undefined ? Boolean(existing.is_active) : Boolean(req.body.is_active);
    const product = await saveProduct(productId, { ...parsed.value, is_active: isActive });
    const platforms = await getProductPlatforms(product.id);
    res.json(toAdminProduct(product, platforms));
  } catch (error: any) {
    if (duplicateSlug(error)) return res.status(400).json({ message: 'A product with that slug already exists' });
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isFinite(productId)) return res.status(400).json({ message: 'Invalid product' });

    const deleted = await deleteProductById(productId);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: `${deleted.name} deleted.`, id: deleted.id });
  } catch (error: any) {
    if (error?.code === '23503') {
      return res.status(400).json({
        message: 'This product still has orders or licenses linked to it, so it cannot be deleted yet.',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const uploadProductFile = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const product = await getProductById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!supabaseStorage) {
      return res.status(503).json({ message: 'File storage is not configured' });
    }

    const platform = String(req.body.platform || (product.type === 'web' ? 'web' : ''));
    const version = String(req.body.version || '1.0.0').trim();
    if (platform !== 'windows' && platform !== 'mac' && platform !== 'web') {
      return res.status(400).json({ message: 'Platform must be windows, mac, or web' });
    }

    const uploaded = req.files as { file?: Express.Multer.File[]; files?: Express.Multer.File[] } | undefined;
    const files = [...(uploaded?.file || []), ...(uploaded?.files || [])];
    if (files.length === 0) return res.status(400).json({ message: 'Choose a file or folder to upload' });

    const saved = [];
    for (const file of files) {
      const relative = file.originalname.replace(/\\/g, '/');
      const safeName = relative
        .split('/')
        .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, '_'))
        .join('/');
      const storagePath = `${productId}/${platform}/${version}/${Date.now()}-${safeName}`;
      const { error } = await supabaseStorage.storage.from('product-files').upload(storagePath, file.buffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      });
      if (error) return res.status(500).json({ message: error.message });
      saved.push(await addProductFile({
        product_id: productId,
        platform,
        version,
        storage_path: storagePath,
      }));
    }

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDownloadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const platform = req.params.platform;
    const userId = req.user!.id;

    const product = await getProductById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const owns = product.is_free || (await userHasAccess(userId, productId));
    if (!owns) return res.status(403).json({ message: 'You have not purchased this product' });

    if (platform !== 'windows' && platform !== 'mac' && platform !== 'web') {
      return res.status(400).json({ message: 'Platform must be windows, mac, or web' });
    }

    const platformUrl =
      platform === 'windows'
        ? product.windows_download_url
        : platform === 'mac'
          ? product.mac_download_url
          : null;
    const downloadUrl = platformUrl || product.free_download_url;
    if (downloadUrl) {
      return res.json({ downloadUrl });
    }

    if (!supabaseStorage) return res.status(503).json({ message: 'File storage is not configured' });

    const file = await getLatestProductFile(productId, platform);
    if (!file) return res.status(404).json({ message: `No ${platform} download is available yet` });

    const { data, error } = await supabaseStorage.storage.from('product-files').createSignedUrl(file.storage_path, 300);
    if (error || !data) {
      return res.status(500).json({ message: error?.message || 'Could not generate download link' });
    }

    res.json({ downloadUrl: data.signedUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const grantAccess = async (req: AuthRequest, res: Response) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const productId = Number(req.body.productId);
    const user = await findUserByEmail(email);
    const product = await getProductById(productId);
    if (!user || !product) return res.status(404).json({ message: 'User or product not found' });
    if (await userOwnsProduct(user.id, product.id)) {
      return res.status(409).json({ message: 'That user already has this product' });
    }

    await createOrder({
      user_id: user.id,
      product_id: product.id,
      amount: 0,
      status: 'paid',
    });
    const license = await ensureLicense(user.id, product);
    res.status(201).json({ message: 'Access granted', licenseKey: license?.license_key || null });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await getUserPurchases(req.user!.id);
    const purchases = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type,
        pricing_model: row.pricing_model,
        price: Number(row.price),
        platforms: await getProductPlatforms(row.id),
        created_at: row.purchased_at,
        license_key: row.license_key,
        subscription_id: row.subscription_id,
        subscription_status: row.subscription_status,
        current_period_end: row.current_period_end,
        cancel_at_period_end: Boolean(row.cancel_at_period_end),
      }))
    );
    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
