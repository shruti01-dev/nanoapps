import nodemailer from 'nodemailer';
import dns from 'dns';

const resolveIpv4 = async (hostname: string) => {
  try {
    const records = await dns.promises.resolve4(hostname);
    if (records[0]) return records[0];
  } catch {
    // Some hosts, including Render, answer Gmail with IPv6 only.
  }

  const lookedUp = await dns.promises.lookup(hostname, { family: 4 });
  if (!lookedUp.address || lookedUp.address.includes(':')) {
    throw new MailError('The mailbox server has no reachable IPv4 address.');
  }
  return lookedUp.address;
};

const publicSite = 'https://nanoapps.vercel.app';

export const frontendUrl = () => {
  const configured = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (!configured || configured.includes('localhost')) return publicSite;
  return configured.split(',')[0];
};

export const mailIsConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export class MailError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export const sendEmail = async (to: string, subject: string, text: string) => {
  if (!mailIsConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Email not sent (SMTP is not configured).\nTo: ${to}\nSubject: ${subject}\n${text}`);
    }
    throw new MailError(
      'The email could not be sent because the server mailbox is not configured.',
      503
    );
  }

  const user = process.env.SMTP_USER?.trim() || '';
  const pass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
  const host = process.env.SMTP_HOST || '';
  const gmail = host.includes('gmail.com');
  const configuredFrom = process.env.EMAIL_FROM || '';
  const from = gmail && !configuredFrom.includes(user) ? user : configuredFrom || user;
  const port = Number(process.env.SMTP_PORT || (gmail ? 465 : 587));

  const timeouts = { connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 };
  const hostname = gmail ? 'smtp.gmail.com' : host;
  const address = await resolveIpv4(hostname);
  const transporter = nodemailer.createTransport({
    host: address,
    port: gmail ? 587 : port,
    secure: gmail ? false : process.env.SMTP_SECURE === 'true' || port === 465,
    requireTLS: gmail,
    tls: { servername: hostname },
    auth: { user, pass },
    ...timeouts,
  });

  try {
    await transporter.sendMail({ from, to, subject, text });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown mail error';
    console.error('Email delivery failed:', reason);
    throw new MailError(`The email could not be delivered. ${reason}`);
  }
};
