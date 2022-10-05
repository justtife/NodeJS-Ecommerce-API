const MailConfig = require("./nodemailerConfig");
const NodeMailer = require("nodemailer");
const sendEMail = async ({ from, to, subject, html }) => {
  const transporter = NodeMailer.createTransport(MailConfig);
  return transporter.sendMail({ from, to, subject, html });
};

module.exports = sendEMail;
