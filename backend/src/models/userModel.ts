import { pool } from '../config/db';

export const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP,
      role VARCHAR(20) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pending_registrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      verification_token VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  return result.rows[0];
};

export const findUserById = async (id: number) => {
  const result = await pool.query(
    'SELECT id, name, email, role, is_verified FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const listUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

export const promoteAdminByEmail = async (email: string) => {
  const result = await pool.query(
    `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email`,
    [email]
  );
  return result.rows[0];
};

export const deleteUnverifiedUser = async (email: string) => {
  await pool.query('DELETE FROM users WHERE LOWER(email) = LOWER($1) AND is_verified = FALSE', [email]);
};

export const savePendingRegistration = async (
  name: string,
  email: string,
  hashedPassword: string,
  tokenHash: string,
  expiresAt: Date
) => {
  await pool.query(
    `INSERT INTO pending_registrations (name, email, password, verification_token, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       password = EXCLUDED.password,
       verification_token = EXCLUDED.verification_token,
       expires_at = EXCLUDED.expires_at`,
    [name, email, hashedPassword, tokenHash, expiresAt]
  );
};

export const deletePendingRegistration = async (email: string) => {
  await pool.query('DELETE FROM pending_registrations WHERE LOWER(email) = LOWER($1)', [email]);
};

export const findPendingByEmail = async (email: string) => {
  const result = await pool.query(
    'SELECT * FROM pending_registrations WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0];
};

export const takePendingRegistration = async (tokenHash: string) => {
  const result = await pool.query(
    `DELETE FROM pending_registrations
     WHERE verification_token = $1 AND expires_at > NOW()
     RETURNING *`,
    [tokenHash]
  );
  return result.rows[0];
};

export const createVerifiedUser = async (name: string, email: string, hashedPassword: string) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, is_verified, verification_token)
     VALUES ($1, $2, $3, TRUE, NULL)
     RETURNING id, name, email, role`,
    [name, email, hashedPassword]
  );
  return result.rows[0];
};

export const createUser = async (name: string, email: string, hashedPassword: string, verificationToken: string) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, verification_token) 
     VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
    [name, email, hashedPassword, verificationToken]
  );
  return result.rows[0];
};

export const setVerificationToken = async (userId: number, token: string) => {
  await pool.query('UPDATE users SET verification_token = $1 WHERE id = $2', [token, userId]);
};

export const verifyUserEmail = async (token: string) => {
  const result = await pool.query(
    `UPDATE users SET is_verified = TRUE, verification_token = NULL 
     WHERE verification_token = $1 RETURNING id, email`,
    [token]
  );
  return result.rows[0];
};

export const setResetToken = async (email: string, token: string, expiry: Date) => {
  const result = await pool.query(
    `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE LOWER(email) = LOWER($3) RETURNING id, email`,
    [token, expiry, email]
  );
  return result.rows[0];
};

export const findUserByValidResetToken = async (token: string) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
    [token]
  );
  return result.rows[0];
};

export const updatePasswordAndClearToken = async (userId: number, hashedPassword: string) => {
  await pool.query(
    `UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2`,
    [hashedPassword, userId]
  );
};