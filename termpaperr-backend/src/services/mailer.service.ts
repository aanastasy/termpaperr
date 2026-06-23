import nodemailer from "nodemailer";

import { getSmtpConfig } from "../config/email.js";

export async function sendTransactionalEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const smtp = getSmtpConfig();
  if (!smtp) {
    return;
  }
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });
  await transporter.sendMail({
    from: smtp.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
