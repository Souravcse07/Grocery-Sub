const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'Brevo', 'SendGrid', etc.
  auth: {
    user: process.env.EMAIL_USER || 'dummy_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'dummy_password'
  }
});

module.exports = transporter;
