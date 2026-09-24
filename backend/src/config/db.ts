import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL (Neon)');
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(-1);
});