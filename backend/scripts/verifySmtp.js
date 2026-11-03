/**
 * SMTP Connectivity & Diagnostics Verification Tool
 * Usage: node backend/scripts/verifySmtp.js [optional_test_recipient_email]
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { verifySmtpConnection, sendOTPEmail } = require('../services/emailService');

async function runSmtpDiagnostics() {
  console.log(`====================================================`);
  console.log(`🔍 Fit Health SMTP Diagnostics & Health Check`);
  console.log(`====================================================`);
  console.log(`Host:     ${process.env.SMTP_HOST || 'Not Configured'}`);
  console.log(`Port:     ${process.env.SMTP_PORT || 'Not Configured'}`);
  console.log(`User:     ${process.env.SMTP_USER || 'Not Configured'}`);
  console.log(`Password: ${process.env.SMTP_PASS ? '******** (configured)' : 'MISSING'}`);
  console.log(`Secure:   ${process.env.SMTP_PORT === '465' ? 'true (SSL)' : 'false (STARTTLS)'}`);
  console.log(`From:     ${process.env.SMTP_FROM || 'Default'}`);
  console.log(`----------------------------------------------------`);

  console.log(`⏳ Testing socket connection and credential authentication...`);
  const status = await verifySmtpConnection();

  if (status.verified) {
    console.log(`✅ SUCCESS: ${status.message}`);
    
    // Check if test recipient email is provided
    const targetEmail = process.argv[2] || process.env.SMTP_USER;
    if (targetEmail) {
      console.log(`\n📨 Dispatching test verification code to: ${targetEmail}...`);
      const testCode = '882941';
      const result = await sendOTPEmail(targetEmail, testCode, 'registration', 'member');
      if (result.delivered) {
        console.log(`🎉 TEST EMAIL ACCEPTED BY SMTP SERVER! (Message ID: ${result.messageId})`);
        console.log(`💡 Note: SMTP acceptance confirms provider transmission. Check your inbox/spam folder.`);
      } else {
        console.warn(`⚠️ Test email simulation or provider notice:`, result);
      }
    }
  } else {
    console.error(`❌ FAILED: ${status.message}`);
    if (status.error) {
      console.error(`Detailed Error:`, status.error);
    }
    console.log(`\nTroubleshooting Instructions:`);
    console.log(`1. For Gmail: Ensure 2-Step Verification is active and generate a 16-character App Password at:`);
    console.log(`   https://myaccount.google.com/apppasswords`);
    console.log(`2. For Brevo: Use host smtp-relay.brevo.com, port 587, and your Brevo SMTP Master Key.`);
    console.log(`3. Check that your firewall or anti-virus is not blocking ports 465 or 587.`);
  }

  console.log(`====================================================\n`);
  process.exit(status.verified ? 0 : 1);
}

runSmtpDiagnostics().catch((err) => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});

