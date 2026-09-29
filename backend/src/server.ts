import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';
import { createUsersTable, promoteAdminByEmail } from './models/userModel';
import { createProductsTable, createProductFilesTable, ensureBuiltinTools } from './models/productModel';
import { createOrdersTable } from './models/orderModel';
import { ensureProductBucket } from './config/supabaseStorage';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import contactRoutes from './routes/contactRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { AuthRequest } from './middleware/authMiddleware';

dotenv.config();

const app = express();

const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const isAllowedOrigin = (origin: string) => {
  const normalized = origin.replace(/\/$/, '');
  if (origins.includes(normalized)) return true;
  try {
    const url = new URL(normalized);
    return url.protocol === 'https:' && url.hostname.endsWith('.vercel.app') && url.hostname.startsWith('nanoapps');
  } catch {
    return false;
  }
};

app.set('trust proxy', 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  })
);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as AuthRequest).rawBody = buf;
    },
  })
);

app.get('/', (_req, res) => {
  res.json({ message: 'Nanoapps API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error('DATABASE_URL and JWT_SECRET are required');
    process.exit(1);
  }

  try {
    await pool.query('SELECT NOW()');
    await createUsersTable();
    await createProductsTable();
    await createProductFilesTable();
    await createOrdersTable();
    await ensureBuiltinTools();
    await ensureProductBucket();
    if (process.env.ADMIN_EMAIL) {
      const admin = await promoteAdminByEmail(process.env.ADMIN_EMAIL.trim().toLowerCase());
      if (admin) console.log(`Admin role set for ${admin.email}`);
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
