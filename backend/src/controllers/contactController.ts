import { Request, Response } from 'express';
import { MailError, sendEmail } from '../utils/email';

export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required' });
    if (!email.includes('@') || message.length > 5000) {
      return res.status(400).json({ message: 'Check the email and keep the message under 5000 characters' });
    }
    const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'support@nanoapps.in';
    await sendEmail(to, `Message from ${name}`, `${message}\n\n— ${name} (${email})`);
    res.json({ message: 'Message sent' });
  } catch (error: any) {
    const status = error instanceof MailError ? error.status : 500;
    res.status(status).json({ message: error.message });
  }
};
