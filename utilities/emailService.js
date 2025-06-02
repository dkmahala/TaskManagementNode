const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: config.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

module.exports = {
  sendEmail,
};
