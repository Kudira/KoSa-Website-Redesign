import { Resend } from 'resend';

export interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

let resend: Resend | null = null;
function getResend() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

export async function sendMail(opts: MailOptions) {
  const from = process.env.FROM_EMAIL || 'no-reply@ko-sa.com';
  const client = getResend();
  if (!client) {
    console.warn('[email] RESEND_API_KEY missing would have sent:', opts.subject);
    return { sent: false };
  }
  try {
    const html = opts.html ?? (opts.text ? `<pre>${opts.text}</pre>` : '<p></p>');
    const text = opts.text ?? html.replace(/<[^>]+>/g, '');
    await client.emails.send({
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      text,
      html,
      replyTo: opts.replyTo,
    });
    return { sent: true };
  } catch (e) {
    console.error('[email] send failed', e);
    return { sent: false, error: (e as Error).message };
  }
}
