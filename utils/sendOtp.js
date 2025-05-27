const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpToWhatsApp = async (toPhone, otp) => {

  const to = 'whatsapp:' + toPhone;
  const body = `👋 Hello! Your verification code is: *${otp}*.\n\nPlease enter it to verify your WhatsApp number.`;

  await client.messages.create({ from: fromNumber, to, body });
};

module.exports = { sendOtpToWhatsApp, generateOTP };
