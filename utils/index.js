const { createJWT, verifyToken, attachCookiesToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const sendEmail = require("./sendMail");
const verificationEmail = require("./Emails/verificationMail");
const verifiedEmail = require("./Emails/verifiedMail");
const passwordResetMail = require("./Emails/passwordResetMail");
const passwordConfirmationMessage = require("./Emails/passwordConfirmationMessage");
module.exports = {
  createJWT,
  verifyToken,
  attachCookiesToResponse,
  createTokenUser,
  sendEmail,
  verificationEmail,
  verifiedEmail,
  passwordResetMail,
  passwordConfirmationMessage,
};
