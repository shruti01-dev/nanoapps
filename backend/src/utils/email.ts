import nodemailer from 'nodemailer';
import dns from 'dns';
import { Resolver } from 'dns/promises';

const ipv4From = async (hostname: string, server?: string) => {
  if (!server) {
    const records = await dns.promises.resolve4(hostname);
    return records[0];
  }
  const resolver = new Resolver();
  resolver.setServers([server]);
  const records = await resolver.resolve4(hostname);
  return records[0];
};

const resolveIpv4 = async (hostname: string) => {
  for (const server of ['8.8.8.8', '1.1.1.1', undefined]) {
    try {
      const address = await ipv4From(hostname, server);
      if (address && !address.includes(':')) return address;
    } catch {
      // Render's own DNS often has no IPv4 answer for Gmail.
    }
  }

  try {
    const lookedUp = await dns.promises.lookup(hostname, { family: 4 });
    if (lookedUp.address && !lookedUp.address.includes(':')) return lookedUp.address;
  } catch {
    // No system IPv4 result either.
  }

  throw new MailError('The mailbox server has no reachable IPv4 address.');
};

const publicSite = 'https://nanoapps.vercel.app';

export const frontendUrl = () => {
  const configured = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/$/, '');
  if (!configured || configured.includes('localhost')) return publicSite;
  return configured.split(',')[0];
};

export const mailIsConfigured = () =>
  Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));

const sendWithResend = async (to: string, subject: string, text: string) => {
  const from = process.env.RESEND_FROM || 'Nanoapps <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!response.ok) {
    let reason = `Resend returned ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) reason = body.message;
    } catch {
      // The body was not JSON.
    }
    throw new MailError(`The email could not be delivered. ${reason}`);
  }
};

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

  if (process.env.RESEND_API_KEY) {
    try {
      await sendWithResend(to, subject, text);
    } catch (error) {
      if (error instanceof MailError) throw error;
      const reason = error instanceof Error ? error.message : 'Unknown mail error';
      throw new MailError(`The email could not be delivered. ${reason}`);
    }
    return;
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

  try {
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
    await transporter.sendMail({ from, to, subject, text });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown mail error';
    console.error('Email delivery failed:', reason);
    throw new MailError(`The email could not be delivered. ${reason}`);
  }
};
