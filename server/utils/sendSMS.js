const twilio = require('twilio');

const sendSMS = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

  let formattedTo = String(to || '').trim();
  if (formattedTo.length === 10 && !formattedTo.startsWith('+')) {
    formattedTo = '+91' + formattedTo;
  } else if (!formattedTo.startsWith('+')) {
    formattedTo = '+' + formattedTo;
  }

  if (!accountSid || !authToken) {
    console.log(`\n=========================================\n[SMS MOCK NOTIFICATION]\nTo: ${formattedTo}\nMessage: ${message}\n(Add TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN to .env to send real SMS)\n=========================================\n`);
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedTo
    });
    console.log(`[SMS SENT] To: ${formattedTo}`);
  } catch (err) {
    console.error(`[SMS ERROR] Failed to send SMS to ${formattedTo}:`, err.message);
  }
};

module.exports = sendSMS;
