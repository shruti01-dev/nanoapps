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

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Email delivery failed:', error instanceof Error ? error.message : error);
    throw new MailError('The email could not be delivered. Check the mailbox settings.');
  }
};
