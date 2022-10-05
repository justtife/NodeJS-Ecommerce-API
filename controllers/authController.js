const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom");
const crypto = require("crypto");
const {
  verificationEmail,
  verifiedEmail,
  passwordResetMail,
  passwordConfirmationMessage,
} = require("../utils");
module.exports = class AuthAPI {
  static async register(req, res) {
    const {
      lastname,
      firstname,
      email,
      password,
      country,
      phoneNumber,
      securityQuestion,
    } = req.body;
    let role = "user";
    const numOfUsers = await User.countDocuments({});
    if (numOfUsers < 1) {
      //Role of First Created User
      role = "owner";
    } else if (numOfUsers > 1 && numOfUsers < 3) {
      //Role of Second and Third Created User
      role = twoThreeAccount ? "admin" : "user";
    } else {
      role = "user";
    }
    //Create Verification token
    const verificationToken = crypto.randomBytes(40).toString("hex");
    const tenMinutes = 10 * 60 * 1000;
    const verificationTokenExpiry = new Date(Date.now() + tenMinutes);
    //Create New User
    const user = await User.create({
      "name.first": firstname,
      "name.last": lastname,
      email,
      password,
      role,
      phone_number: phoneNumber,
      security_question: securityQuestion,
      country,
      verificationToken,
      verificationTokenExpiry,
    });
    //Send Verification Email
    await verificationEmail({
      name: user.name.first,
      email: user.email,
      verificationToken,
    });
    //User Created
    res.status(StatusCodes.CREATED).json({
      msg: "User created successfully, please check mail to verify account",
    });
  }
  static async verifyAccount(req, res) {
    const { verificationToken, email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return CustomError.NotFoundError(
        "Invalid email or verification token, generate another link"
      );
    }
    if (
      user.verificationToken == verificationToken &&
      user.verificationTokenExpiry > new Date(Date.now())
    ) {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      await user.save();
      //Send verified mail
      await verifiedEmail({ name: user.name.first, email });
      //User Verified
      return res.status(StatusCodes.OK).json({
        msg: "User account successfully validated, you can now proceed to login",
      });
    }
    //Expired or wrong token
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: "An error occured, please generate another link as this link is either expired or incorrect",
    });
  }
  static async resendVerificationMail(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return CustomError.NotFoundError(
        "User does not exist, signup to get a worth for your class"
      );
    }
    // User Not Verified
    if (!user.isVerified) {
      let verificationToken = "";
      const fiveMinutes = 5 * 60 * 1000;
      //   Verification Token Expiry is beyond five minutes from now
      if (user.verificationTokenExpiry <= new Date(Date.now() + fiveMinutes)) {
        const tenMinutes = 10 * 60 * 1000;
        verificationToken = crypto.randomBytes(40).toString("hex");
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = new Date(Date.now() + tenMinutes);
        await user.save();
        await sendVerificationMail({
          name: user.name.first,
          email: user.email,
          verificationToken,
        });
        return res.status(StatusCodes.OK).json({ msg: "Email has been sent" });
        //Verification Token Expiry exceeds five minutes from now
      } else {
        verificationToken = user.verificationToken;
        await verificationEmail({
          name: user.name.first,
          email: user.email,
          verificationToken,
        });
      }
      return res
        .status(StatusCodes.OK)
        .json({ msg: "Email has been sent again" });
    }
    res
      .status(StatusCodes.OK)
      .json({ msg: "This account is already verified" });
  }
  static async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return CustomError.BadRequestError("Invalid Request");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return CustomError.NotFoundError(
        "Invalid Request, please ensure email and password exists and are correct"
      );
    }
    const isPassCorrect = await user.comparePassword(password);
    if (!isPassCorrect) {
      return CustomError.BadRequestError(
        "Invalid Request, please ensure email and password are correct"
      );
    }
    if (!user.isVerified) {
      return CustomError.UnauthorizedError(
        "Account is not verified, please verify account before proceeding to login"
      );
    }
    //Create new token user and attach to cookie
    const tokenUser = createTokenUser(user);
    let refreshToken = "";
    // Check if there is an existing login credential from this user
    const existingToken = await Token.findOne({ user: user._id });
    if (existingToken) {
      const { isValid } = existingToken;
      if (!isValid) {
        return CustomError.UnauthorizedError(
          "Invalid Request, Please login again"
        );
      }
      //Create a new token for the user if there is an exsting token
      refreshToken = existingToken.refreshToken;
      attachCookiesToResponse({ res, user: tokenUser, refreshToken });
      res.status(StatusCodes.OK).json({ user: tokenUser });
      return;
    }
    //If there is no existing token, create new token collection
    refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const userToken = { refreshToken, ip, userAgent, user: user._id };
    await Token.create(userToken);
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
  }
  static async logout(req, res) {
    //Delete existing token credentials
    await Token.findOneAndDelete({ user: req.user.userID });
    //Change  Access token cookie and expire
    res.cookie("accessToken", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    //Change refresh token cookie and expire
    res.cookie("refreshToken", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: "Logged out" });
  }
  static async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return CustomError.BadRequestError("Invalid Request");
    }
    const user = await User.findOne({ email });
    if (user) {
      const fiveMinutes = 5 * 60 * 1000;
      let passwordToken = "";
      //Check if there's an existing password token
      //If there is, also check if its expiry is exceeds five minutes from now
      if (
        user.passwordToken &&
        user.passwordtokenExpiry > new Date(Date.now() + fiveMinutes)
      ) {
        passwordToken = user.passwordToken;
        await passwordResetMail({
          name: user.name.first,
          email,
          passwordToken,
        });
      }
      //If there's no existing password token
      //Or the expiry is not beyond five minutes from now
      passwordToken = crypto.randomBytes(70).toString("hex");
      const fifteenMinutes = 15 * 60 * 1000;
      user.passwordToken = createHash(passwordToken);
      user.passwordtokenExpiry = new Date(Date.now() + fifteenMinutes);
      await user.save();
      await passwordResetMail({ name: user.name.first, email, passwordToken });
      return res
        .status(StatusCodes)
        .json("Please check email for reset password link");
    }
    return CustomError.NotFoundError("User does not Exist");
  }
  static async resetPassword(req, res) {
    const { passwordToken } = req.query;
    const { email, password } = req.body;
    if (!passwordToken || !email || !password) {
      return CustomError.BadRequestError("Invalid Request");
    }
    const user = await User.findOne({ email });
    if (user) {
      //Check if the password token is the same with the one in the user's collection detail
      if (
        user.passwordToken == createHash(passwordToken) &&
        user.passwordtokenExpiry > new Date(Date.now())
      ) {
        user.password = password;
        user.passwordToken = null;
        user.passwordtokenExpiry = null;
        await user.save();
        //Send Confirmation Message to user to inform the user of the change
        await passwordConfirmationMessage({
          email,
          date: new Date(Date.now()),
        });
      }
      return res
        .status(StatusCodes.OK)
        .json({ msg: "Password has been changed, proceed to login" });
    }
    return CustomError.BadRequestError("Invalid Request");
  }
};
