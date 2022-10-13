const CustomError = require("../errors/custom");
const { verifyToken, attachCookiesToResponse } = require("../utils");
const Token = require("../models/Token");
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        CustomError.UnauthorizedError("Unauthorized to access this route")
      );
    }
  };
};

const authenticatePass = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  if (!accessToken || !refreshToken) {
    return next(
      CustomError.UnauthorizedError("No logged in user, please login")
    );
  }
  try {
    let payload = "";
    if (accessToken) {
      payload = verifyToken(accessToken);
      const { userID, name, role } = payload.user;
      req.user = { userID, name, role };
      return next();
    }
    payload = verifyToken(refreshToken);
    const { userID, name, role } = payload.user;
    req.user = { userID, name, role };
    const existingToken = await Token.findOne({
      user: payload.user.userID,
      refreshToken: payload.refreshToken,
    });
    if (!existingToken || !existingToken.isValid) {
      return next(CustomError.UnauthorizedError("Authentication Error"));
    }
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    next();

    //   const existingToken = await Token.findOne({})
  } catch (err) {
    console.error(`An error occured; ${err}`);
  }
};

module.exports = {
  checkRole,
  authenticatePass,
};
