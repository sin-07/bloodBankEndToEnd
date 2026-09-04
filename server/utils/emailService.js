const nodemailer = require('nodemailer');

/**
 * Email service using Nodemailer
 * Sends transactional emails (notifications, alerts, etc.)
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log(`[TEST] Email to ${to}: ${subject}`);
      return { success: true, messageId: 'test-id' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"A2R Demo" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw - email failures shouldn't break the main flow
    return { success: false, error: error.message };
  }
};

/**
 * Send blood request notification to multiple donors
 */
const sendBulkNotification = async (recipients, subject, html) => {
  const results = [];
  for (const email of recipients) {
    const result = await sendEmail({ to: email, subject, html });
    results.push({ email, ...result });
  }
  return results;
};

module.exports = { sendEmail, sendBulkNotification };
