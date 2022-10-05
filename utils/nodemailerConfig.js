require("dotenv").config();
module.exports = {
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.NODEMAILER_PASS,
  },
};
