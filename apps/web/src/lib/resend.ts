import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'alerts@competitortracker.io';

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Verify your email for Competitor Change Tracker',
    html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  });
}
