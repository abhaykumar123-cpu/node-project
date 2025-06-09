// mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendContactEmail = (name, email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Contact Form: ${subject}`,
    text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendContactEmail;
