const { createJWT, verifyToken, attachCokieToResponse } = require("./jwt");
const sendEmail = require("./sendMail");
const verificationEmail = require("./verificationMail");
const verifiedEmail = require("./verifiedMail");
const passwordResetMail = require("./passwordResetMail");
const passwordConfirmationMessage = require("./passwordConfirmationMessage");
module.exports = {
  createJWT,
  verifyToken,
  attachCokieToResponse,
  sendEmail,
  verificationEmail,
  verifiedEmail,
  passwordResetMail,
  passwordConfirmationMessage,
};
