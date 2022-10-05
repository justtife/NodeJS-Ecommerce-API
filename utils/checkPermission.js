const CustomError = require("../errors/custom");
const checkPermission = (requestUser, resourceID) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userID === resourceID.toString()) return;
  return CustomError.UnauthorizedError(
    "You are unauthorised to access this route, ensure you are logged in"
  );
};
module.exports = checkPermission;
