import crypto from 'crypto';

export const createRawToken = () => crypto.randomBytes(32).toString('hex');

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateLicenseKey = () => {
  const chunk = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `NA-${chunk()}-${chunk()}-${chunk()}`;
};
