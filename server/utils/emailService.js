const transporter = require('../config/nodemailer');

exports.sendOrderConfirmation = async (email, orderId, total) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'dummy_email@gmail.com',
    to: email,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your delivery is being prepared. Your order ID is <strong>${orderId}</strong>.</p>
      <p>Total Amount: <strong>₹${total}</strong></p>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation sent to ${email}`);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

exports.sendPaymentFailed = async (email, subscriptionId) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'dummy_email@gmail.com',
    to: email,
    subject: `Payment Failed - Subscription Halted`,
    html: `
      <h2>Payment Action Required</h2>
      <p>We could not process the payment for your subscription <strong>${subscriptionId}</strong>.</p>
      <p>Please update your payment method to resume your deliveries.</p>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment failure notice sent to ${email}`);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

exports.sendSeasonalSwap = async (email, items) => {
  const itemList = items.map(i => `<li>${i}</li>`).join('');
  const mailOptions = {
    from: process.env.EMAIL_USER || 'dummy_email@gmail.com',
    to: email,
    subject: `Seasonal Produce Update - FreshBox`,
    html: `
      <h2>Seasonal Produce Alert!</h2>
      <p>Some items in your subscription are going out of season. We suggest swapping them to guarantee freshness:</p>
      <ul>${itemList}</ul>
      <p>Log into your Dashboard to manage your subscription.</p>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Seasonal swap alert sent to ${email}`);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};
