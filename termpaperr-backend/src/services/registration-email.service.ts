import { getSmtpConfig } from "../config/email.js";

import { sendTransactionalEmail } from "./mailer.service.js";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export async function sendBookRegistrationConfirmationEmail(options: {
  to: string;
  bookTitle: string;
  bookAuthor: string;
  paymentMethod: string;
  registrationId: string;
}): Promise<void> {
  const subject = `Registration confirmed: ${options.bookTitle}`;
  const text = [
    `Your registration is confirmed.`,
    ``,
    `Book: ${options.bookTitle}`,
    `Author: ${options.bookAuthor}`,
    `Payment method: ${options.paymentMethod}`,
    `Registration id: ${options.registrationId}`,
    ``,
    `Thank you for registering.`,
  ].join("\n");
  const html = `<p>Your registration is confirmed.</p>
<p><strong>${escapeHtml(options.bookTitle)}</strong><br/>
Author: ${escapeHtml(options.bookAuthor)}<br/>
Payment method: ${escapeHtml(options.paymentMethod)}<br/>
Registration id: ${escapeHtml(options.registrationId)}</p>
<p>Thank you for registering.</p>`;
  await sendTransactionalEmail({
    to: options.to,
    subject,
    text,
    html,
  });
  if (!getSmtpConfig()) {
    console.warn(
      `[registration-email] (no SMTP) Would notify ${options.to}: ${subject}`,
    );
  }
}
