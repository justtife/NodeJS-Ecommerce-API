const CustomError = require("../errors/custom");
const { verifyToken } = require("../utils");
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return CustomError.UnauthorizedError("Unauthorized to acces this route");
    }
  };
};

const authenticatePass = async () => {
  const { accessToken, refreshToken } = req.signedCookies;
  let payload = "";
  if (accessToken) {
    payload = verifyToken(accessToken);
    const { userID, name, role } = payload.user;
    req.user = { userID, name, role };
    return next();
  }
  payload = verifyToken(refreshToken);
  //   const existingToken = await Token.findOne({})
};

module.exports = {
  checkRole,
  authenticatePass,
};
