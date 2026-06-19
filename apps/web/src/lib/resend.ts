import { Resend } from 'resend';

import { BRANDING } from '@cct/db';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? `alerts@${BRANDING.name.toLowerCase()}.com`;

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `Verify your email for ${BRANDING.name}`,
    html: `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  });
}
