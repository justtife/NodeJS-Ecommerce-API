const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom");
const Token = require("../models/Token");
const cloudinary = require("cloudinary").v2;
const {
  checkPermission,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");
module.exports = class UserAPI {
  static async getAllUsers(req, res) {
    const users = await User.find({ role: "user" }).select("-password -role");
    res.status(StatusCodes.OK).json({ user: users });
  }
  static async getSingleUser(req, res,next) {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return next(
        CustomError.NotFoundError(
          "No user with the request credentials, please login "
        )
      );
    }
    checkPermission(req.user, user._id);
    res.status(StatusCodes.OK).json({ user });
  }
  static async updateUser(req, res, next) {
    const { firstname, lastname, country, phoneNumber } = req.body;
    if (!firstname || !lastname || !country || !phoneNumber) {
      return next(CustomError.BadRequestError("Invalid Credentials"));
    }
    const user = await User.findOne({ _id: req.user.id });
    let profile_image = "";
    if (req.file) {
      if (user.image != "") {
        await cloudinary.uploader.destroy(user.image.split(" ")[0]);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "user-images",
      });
      profile_image = result.public_id + " " + result.url;
    }
    // checkPermission(req.user, user._id);
    user.name.first = firstname;
    user.name.last = lastname;
    user.country = country;
    user.image = profile_image;
    user.phone_number = phoneNumber;
    await user.save();
    const tokenUser = createTokenUser(user);
    const existingToken = await Token.findOne({ user: req.user.id });
    attachCookiesToResponse({
      res,
      user: tokenUser,
      refreshToken: existingToken.refreshToken,
    });
    res
      .status(StatusCodes.OK)
      .json({ msg: "User details successfully updated" });
  }
  static async changePassword(req, res, next) {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return next(CustomError.BadRequestError("Invalid Request"));
    }
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return next(
        CustomError.NotFoundError(
          "An error occured, please ensure you are logged in"
        )
      );
    }
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      //send change password attempt email
      return next(
        CustomError.UnauthorizedError(
          "Invalid Request, please ensure to enter the correct password"
        )
      );
    }
    // checkPermission(req.user, user._id);
    user.password = newPassword;
    await user.save();
    //Send Success changing password mail
    res.status(StatusCodes.OK).json({ msg: "Password successfully updated" });
  }
  static async changeEmailBySecurityQuestion(req, res, next) {
    const { email, newMail, securityQuestion } = req.body;
    if (!email || !newMail || !securityQuestion) {
      return next(CustomError.BadRequestError("Invalid request"));
    }
    const user = await User.findOne({ _id: req.user.id });
    if (user) {
      if (user.security_question == securityQuestion) {
        // checkPermission(req.user, user._id);
        user.email = newMail;
        await user.save();
        //Send mail to both new mail and old email
        return res
          .status(StatusCodes.OK)
          .json({ msg: "Email changed successfully" });
      } else {
        return next(
          CustomError.BadRequestError(
            "Security Question is incorrect, please try again"
          )
        );
      }
    }
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "An error occured, please ensure you are logged in" });
  }
  static async deleteAccount(req, res, next) {
    const { securityQuestion } = req.body;
    if (!securityQuestion) {
      return next(CustomError.BadRequestError("Invalid Request"));
    }
    const user = await User.findOne({ _id: req.user.id });
    if (user) {
      if (user.security_question == securityQuestion) {
        //Send delete token to email
        if (user.image != "") {
          await cloudinary.uploader.destroy(user.image.split(" ")[0]);
        }
        // checkPermission(req.user, user._id);
        await user.remove();
        return res
          .status(StatusCodes.OK)
          .json({ msg: "User Account Successfully Deleted" });
      }
      return next(
        CustomError.UnauthorizedError(
          "Security Question Incorrect, please try again"
        )
      );
    }
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "User not found, please login" });
  }
};
