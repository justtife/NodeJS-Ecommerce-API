const { StatusCodes } = require("http-status-codes");
const ErrorHandler = (err, req, res, next) => {
  let customError = {
    msg: err.message,
    statusCode: err.statusCode,
  };
  switch (err.name) {
    case "ValidationError":
      customError.msg = "Invalid Credentials";
      customError.statusCode = StatusCodes.BAD_REQUEST;
      break;
    default:
      customError.msg =
        err.message || "An error Occured, please try again later";
      customError.statusCode =
        err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      break;
  }
  res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = ErrorHandler;
