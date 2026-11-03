const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { verifySmtpConnection } = require('../services/emailService');

verifySmtpConnection().then((res) => {
  console.log('SMTP Connection Status:', JSON.stringify(res, null, 2));
  process.exit(res.verified ? 0 : 1);
});
