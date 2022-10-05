const authRouter = require("express").Router();
const authAPI = require("../controllers/authController");

authRouter.post("/signup", authAPI.register);
authRouter.get("/verify-account", authAPI.verifyAccount);
authRouter.post("/resend-verification", authAPI.resendVerificationMail);
authRouter.post("/login", authAPI.login);
authRouter.delete("/logout", authAPI.logout);
authRouter.post("/forgot-password", authAPI.forgotPassword);
authRouter.get("/reset-password", authAPI.resetPassword);
module.exports = authRouter;
