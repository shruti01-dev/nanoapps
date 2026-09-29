import nodemailer from 'nodemailer';

export const frontendUrl = () =>
  process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

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

  const transporter = gmail
    ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
    : nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass },
      });

  try {
    await transporter.sendMail({ from, to, subject, text });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown mail error';
    console.error('Email delivery failed:', reason);
    throw new MailError(`The email could not be delivered. ${reason}`);
  }
};
