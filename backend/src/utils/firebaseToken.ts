import jwt from 'jsonwebtoken';

type FirebaseIdentity = {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

let cachedCerts: Record<string, string> | null = null;
let cachedAt = 0;

const googleCerts = async () => {
  if (cachedCerts && Date.now() - cachedAt < 60 * 60 * 1000) return cachedCerts;
  const response = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!response.ok) throw new Error('Firebase certificates could not be loaded');
  cachedCerts = (await response.json()) as Record<string, string>;
  cachedAt = Date.now();
  return cachedCerts;
};

export const verifyFirebaseIdToken = async (token: string): Promise<FirebaseIdentity> => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Firebase is not configured');

  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid token');
  }

  const cert = (await googleCerts())[decoded.header.kid];
  if (!cert) throw new Error('Invalid token');

  const payload = jwt.verify(token, cert, {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  }) as jwt.JwtPayload;

  if (!payload.sub || typeof payload.email !== 'string') throw new Error('Invalid token');

  return {
    uid: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : '',
  };
};
