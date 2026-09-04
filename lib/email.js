import nodemailer from 'nodemailer';

/**
 * Email service using Nodemailer
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      console.log(`[TEST] Email to ${to}: ${subject}`);
      return { success: true, messageId: 'test-id' };
    }

    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')) {
      console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Srishti Blood Bank" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send bulk notification emails
 */
export const sendBulkNotification = async (recipients, subject, html) => {
  const results = [];
  for (const email of recipients) {
    const result = await sendEmail({ to: email, subject, html });
    results.push({ email, ...result });
  }
  return results;
};
