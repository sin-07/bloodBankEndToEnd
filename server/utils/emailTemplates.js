/**
 * Beautiful branded email templates for A2R Demo Blood Bank
 * All emails share a consistent header/footer and red blood-bank theme.
 */

/* ─── Shared Layout ─── */
const layout = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626,#e11d48);padding:32px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="padding-right:10px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </td>
                <td>
                  <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">A2R Demo</span>
                </td>
              </tr>
            </table>
            <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Blood Bank Management System</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fafafa;padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} A2R Demo &mdash; Saving lives, one drop at a time.
            </p>
            <p style="margin:0;font-size:12px;color:#d1d5db;">
              Mumbai, India &bull; contact@a2r-demo.com &bull; +91 98765 43210
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

/* ─── Helpers ─── */
const btn = (text, url) => `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#dc2626;border-radius:8px;padding:14px 32px;">
      <a href="${url}" style="color:#fff;font-weight:700;font-size:15px;text-decoration:none;display:inline-block;">${text}</a>
    </td></tr>
  </table>
`;

const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:140px;font-weight:600;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:#1f2937;border-bottom:1px solid #f3f4f6;">${value}</td>
  </tr>
`;

const infoTable = (rows) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:10px;overflow:hidden;margin:20px 0;">
    ${rows}
  </table>
`;

const heading = (text) => `<h2 style="margin:0 0 16px;font-size:22px;color:#111827;font-weight:700;">${text}</h2>`;
const greeting = (name) => `<p style="font-size:16px;color:#374151;margin:0 0 20px;">Dear <strong>${name}</strong>,</p>`;
const para = (text) => `<p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">${text}</p>`;
const badge = (text, color = '#dc2626') => `<span style="display:inline-block;background:${color};color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">${text}</span>`;

/* ════════════════════════════════════════════════════════════
   EMAIL TEMPLATES
   ════════════════════════════════════════════════════════════ */

/** 1. Welcome — after registration */
const welcomeEmail = ({ name, role, loginUrl }) => ({
  subject: 'Welcome to A2R Demo — Your Account is Ready! 🩸',
  html: layout('Welcome to A2R Demo', `
    ${heading('Welcome to A2R Demo!')}
    ${greeting(name)}
    ${para(`Thank you for registering as a <strong>${role}</strong>. Your account has been created successfully and you're all set to get started.`)}
    ${role === 'donor'
      ? para('You can now explore donation opportunities, check your eligibility, and track your donation history — all from your dashboard.')
      : role === 'hospital'
        ? para('You can now submit blood requests, track fulfillment status, and manage your hospital profile from your dashboard.')
        : para('Welcome aboard! You now have access to the admin panel.')
    }
    ${btn('Go to Dashboard', loginUrl || 'http://localhost:3000/auth/login')}
    ${para('If you have any questions, feel free to reach out to our support team.')}
    <p style="font-size:14px;color:#9ca3af;margin:24px 0 0;">— The A2R Demo Team</p>
  `),
});

/** 2. Login alert */
const loginAlertEmail = ({ name, time, ip }) => ({
  subject: 'Login Alert — A2R Demo',
  html: layout('Login Alert', `
    ${heading('New Login Detected')}
    ${greeting(name)}
    ${para('A new login to your A2R Demo account was detected.')}
    ${infoTable(
      infoRow('Time', time) +
      infoRow('IP Address', ip || 'Unknown')
    )}
    ${para('If this was you, no action is needed. If you didn\'t log in, please change your password immediately.')}
    ${btn('Change Password', 'http://localhost:3000/dashboard/profile')}
  `),
});

/** 3. Blood request created (sent to requester) */
const bloodRequestCreatedEmail = ({ name, bloodGroup, units, urgency, patientName, hospitalName }) => ({
  subject: `Blood Request Submitted — ${bloodGroup} (${units} units)`,
  html: layout('Blood Request Created', `
    ${heading('Blood Request Submitted')}
    ${greeting(name)}
    ${para('Your blood request has been submitted successfully and is being processed.')}
    ${infoTable(
      infoRow('Patient', patientName) +
      infoRow('Blood Group', `<strong style="color:#dc2626;">${bloodGroup}</strong>`) +
      infoRow('Units', units) +
      infoRow('Urgency', badge(urgency, urgency === 'critical' ? '#dc2626' : urgency === 'urgent' ? '#f59e0b' : '#22c55e')) +
      (hospitalName ? infoRow('Hospital', hospitalName) : '')
    )}
    ${para('We will notify you as soon as there\'s an update on your request. You can track the status from your dashboard.')}
    ${btn('Track Request', 'http://localhost:3000/dashboard/requests')}
  `),
});

/** 4. Blood request status update (sent to requester) */
const bloodRequestStatusEmail = ({ name, bloodGroup, units, status, adminNotes }) => ({
  subject: `Blood Request Update — ${status.toUpperCase()}`,
  html: layout('Request Status Update', `
    ${heading('Blood Request Status Update')}
    ${greeting(name)}
    ${para(`Your blood request for <strong style="color:#dc2626;">${bloodGroup}</strong> (${units} units) has been updated.`)}
    <div style="text-align:center;margin:24px 0;">
      ${badge(status, status === 'fulfilled' ? '#22c55e' : status === 'approved' ? '#3b82f6' : status === 'rejected' ? '#ef4444' : '#f59e0b')}
    </div>
    ${adminNotes ? `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#92400e;"><strong>Note from Admin:</strong> ${adminNotes}</p>
    </div>` : ''}
    ${status === 'fulfilled'
      ? para('Great news! Your blood request has been fulfilled. Please coordinate with the blood bank for collection.')
      : status === 'approved'
        ? para('Your request has been approved and we are working on fulfilling it.')
        : para('Please check your dashboard for more details.')
    }
    ${btn('View Details', 'http://localhost:3000/dashboard/requests')}
  `),
});

/** 5. Donor notification for urgent/critical blood request */
const donorUrgentRequestEmail = ({ donorName, bloodGroup, units, urgency, patientName, hospitalName, city, contactNumber }) => ({
  subject: `🚨 ${urgency.toUpperCase()} — ${bloodGroup} Blood Needed in ${city}`,
  html: layout('Urgent Blood Request', `
    <div style="text-align:center;margin-bottom:24px;">${badge(`${urgency} Request`, urgency === 'critical' ? '#dc2626' : '#f59e0b')}</div>
    ${heading('Urgent Blood Requirement')}
    ${greeting(donorName)}
    ${para(`A <strong>${urgency}</strong> blood request has been raised that matches your blood group. Your donation could save a life!`)}
    ${infoTable(
      infoRow('Patient', patientName) +
      infoRow('Blood Group', `<strong style="color:#dc2626;font-size:16px;">${bloodGroup}</strong>`) +
      infoRow('Units Needed', units) +
      infoRow('Hospital', hospitalName || 'N/A') +
      infoRow('City', city) +
      infoRow('Contact', contactNumber)
    )}
    ${btn('Respond to Request', 'http://localhost:3000/dashboard')}
    ${para('If you are available and eligible to donate, please reach out to the contact above or log in to your dashboard.')}
    <p style="font-size:14px;color:#dc2626;font-weight:600;margin-top:16px;">Every drop counts. Thank you for being a lifesaver! ❤️</p>
  `),
});

/** 6. Donation recorded (sent to donor) */
const donationRecordedEmail = ({ name, bloodGroup, units, location, date }) => ({
  subject: 'Thank You for Your Donation! 🩸❤️',
  html: layout('Donation Recorded', `
    ${heading('Donation Recorded Successfully')}
    ${greeting(name)}
    ${para('Thank you for your generous blood donation! Your contribution will help save lives.')}
    ${infoTable(
      infoRow('Blood Group', `<strong style="color:#dc2626;">${bloodGroup}</strong>`) +
      infoRow('Units', units) +
      infoRow('Location', location || 'N/A') +
      infoRow('Date', date)
    )}
    <div style="background:#f0fdf4;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
      <p style="margin:0;font-size:24px;">🏅</p>
      <p style="margin:8px 0 0;font-size:15px;color:#166534;font-weight:600;">You're a hero! Every donation saves up to 3 lives.</p>
    </div>
    ${para('You can download your donation certificate from your dashboard.')}
    ${btn('View Dashboard', 'http://localhost:3000/dashboard/donations')}
    ${para('<em>Note: You will be eligible to donate again after 90 days.</em>')}
  `),
});

/** 7. Hospital verified (sent to hospital) */
const hospitalVerifiedEmail = ({ hospitalName, email }) => ({
  subject: 'Hospital Verified — A2R Demo ✅',
  html: layout('Hospital Verified', `
    ${heading('Hospital Verification Complete')}
    <p style="font-size:16px;color:#374151;margin:0 0 20px;">Dear <strong>${hospitalName}</strong>,</p>
    ${para('Congratulations! Your hospital has been verified on A2R Demo. You now have full access to submit blood requests and manage your profile.')}
    <div style="background:#f0fdf4;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
      <p style="margin:0;font-size:36px;">✅</p>
      <p style="margin:8px 0 0;font-size:15px;color:#166534;font-weight:600;">Your hospital is now verified!</p>
    </div>
    ${btn('Go to Dashboard', 'http://localhost:3000/hospital')}
    ${para('If you have any questions, feel free to contact our admin team.')}
  `),
});

/** 8. Password changed (sent to user) */
const passwordChangedEmail = ({ name }) => ({
  subject: 'Password Changed — A2R Demo',
  html: layout('Password Changed', `
    ${heading('Password Changed Successfully')}
    ${greeting(name)}
    ${para('Your password has been changed successfully. If you did not make this change, please contact us immediately.')}
    ${para('For security, all existing sessions have been invalidated. Please log in again with your new password.')}
    ${btn('Log In', 'http://localhost:3000/auth/login')}
  `),
});

/** 9. Low stock alert (sent to admin) */
const lowStockAlertEmail = ({ alerts }) => ({
  subject: '⚠️ Low Blood Stock Alert — Action Required',
  html: layout('Low Stock Alert', `
    ${heading('Low Blood Stock Alert')}
    <p style="font-size:16px;color:#374151;margin:0 0 20px;">Dear <strong>Admin</strong>,</p>
    ${para('The following blood groups are running low on stock and require immediate attention.')}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;margin:20px 0;border:1px solid #e5e7eb;">
      <tr style="background:#dc2626;">
        <th style="padding:12px;color:#fff;font-size:13px;text-align:left;">Blood Group</th>
        <th style="padding:12px;color:#fff;font-size:13px;text-align:left;">Current Units</th>
        <th style="padding:12px;color:#fff;font-size:13px;text-align:left;">Threshold</th>
        <th style="padding:12px;color:#fff;font-size:13px;text-align:left;">Severity</th>
      </tr>
      ${alerts.map((a, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};">
          <td style="padding:12px;font-size:14px;font-weight:700;color:#dc2626;">${a.bloodGroup}</td>
          <td style="padding:12px;font-size:14px;color:#1f2937;">${a.currentUnits}</td>
          <td style="padding:12px;font-size:14px;color:#6b7280;">${a.threshold}</td>
          <td style="padding:12px;">${badge(a.severity, a.severity === 'critical' ? '#dc2626' : '#f59e0b')}</td>
        </tr>
      `).join('')}
    </table>
    ${btn('Manage Inventory', 'http://localhost:3000/admin/blood-stock')}
    ${para('Please take action to replenish stock levels as soon as possible.')}
  `),
});

/** 10. Bulk request created (sent to hospital) */
const bulkRequestCreatedEmail = ({ hospitalName, count, email }) => ({
  subject: `Bulk Blood Request Submitted — ${count} Requests`,
  html: layout('Bulk Request Created', `
    ${heading('Bulk Blood Request Submitted')}
    <p style="font-size:16px;color:#374151;margin:0 0 20px;">Dear <strong>${hospitalName}</strong>,</p>
    ${para(`Your bulk blood request of <strong>${count} request(s)</strong> has been submitted successfully.`)}
    <div style="background:#eff6ff;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
      <p style="margin:0;font-size:36px;font-weight:800;color:#2563eb;">${count}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#3b82f6;">Requests Submitted</p>
    </div>
    ${para('Our team will review and process your requests shortly. You can track them from your dashboard.')}
    ${btn('Track Requests', 'http://localhost:3000/hospital/requests')}
  `),
});

module.exports = {
  welcomeEmail,
  loginAlertEmail,
  bloodRequestCreatedEmail,
  bloodRequestStatusEmail,
  donorUrgentRequestEmail,
  donationRecordedEmail,
  hospitalVerifiedEmail,
  passwordChangedEmail,
  lowStockAlertEmail,
  bulkRequestCreatedEmail,
};
