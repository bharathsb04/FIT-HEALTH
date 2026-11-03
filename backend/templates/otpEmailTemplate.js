/**
 * Professional, Responsive HTML Email Template for Fit Health Verification
 * Features:
 * - 100% Inline CSS compatible with all email clients (Gmail, Outlook, Apple Mail, Yahoo)
 * - Fit Health branding & color scheme (#10b981 emerald, #0b0f19 dark canvas)
 * - Dynamic 6-digit OTP insertion with high-visibility letter spacing
 * - Role-specific badges (Gym Member / Gym Admin)
 * - Security warnings, expiration info, and readable plain-text fallback
 */

const getOtpEmailTemplate = ({ email, otp, purpose = 'registration', role = 'member' }) => {
  const isRoleAdmin = role === 'admin' || (email && email.toLowerCase().includes('admin'));
  const roleLabel = isRoleAdmin ? 'Gym Administrator' : 'Gym Member';
  const accentColor = isRoleAdmin ? '#f59e0b' : '#10b981';
  const badgeBg = isRoleAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  const badgeBorder = isRoleAdmin ? '#f59e0b' : '#10b981';

  const purposeSubjects = {
    registration: isRoleAdmin ? 'Fit Health: Verify Your Gym Admin Account' : 'Fit Health: Verify Your Email Address',
    login: isRoleAdmin ? 'Fit Health: Admin Portal Security Login Code' : 'Fit Health: Your Login Verification Code',
    password_reset: 'Fit Health: Password Reset Verification Code'
  };

  const subject = purposeSubjects[purpose] || 'Your Fit Health Verification Code';

  // Responsive, inline-styled HTML
  const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #121927; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background-color: ${accentColor}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header & Logo -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      <span style="color: ${accentColor};">⚡</span> FIT HEALTH
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${accentColor}; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 20px;">
                      ${roleLabel} Verification
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 12px 32px 28px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #ffffff; text-align: center; line-height: 1.3;">
                Email Verification
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Hello,<br />
                Welcome to <strong>Fit Health</strong>! Use the verification code below to verify your email address (<strong>${email}</strong>) and activate your account.
              </p>

              <!-- OTP Code Display Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; border: 2px dashed ${accentColor}; border-radius: 12px; padding: 18px 24px;">
                      <tr>
                        <td align="center">
                          <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: ${accentColor}; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; text-align: center; display: block;">
                            ${otp}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Instructions -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d1424; border: 1px solid #1e293b; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      ⏱️ <strong>This code expires in 10 minutes.</strong><br />
                      🔒 <strong>For your security, do not share this code with anyone.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.5; color: #64748b; text-align: center;">
                If you did not request this verification, you can safely ignore this email. No changes will be made to your account.
              </p>

              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                Regards,<br />
                <strong style="color: #ffffff;">Fit Health Security Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                Fit Health — Gym Fitness, Biometrics &amp; Facility Administration Platform.<br />
                This is an automated system email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Clean, readable plain-text fallback
  const text = `
Fit Health - Email Verification
==================================================

Hello,

Welcome to Fit Health!
Use the verification code below to verify your email address (${email}):

--------------------------------------------------
VERIFICATION CODE: ${otp}
--------------------------------------------------

This code expires in 10 minutes.
For your security, do not share this code with anyone.

If you did not request this verification, you can ignore this email.

Regards,
Fit Health Team
  `.trim();

  return { subject, html, text };
};

module.exports = { getOtpEmailTemplate };

