const { StatusCodes } = require("http-status-codes");
const ErrorHandler = (err, req, res, next) => {
  let customError = {
    msg: err.message,
    statusCode: err.statusCode,
  };

  console.log(err);
  console.log(err.errors);
  // console.log(`Error is ${Object.values(err.errors)}`);
  switch (err.name) {
    case "ValidationError":
      customError.statusCode = StatusCodes.BAD_REQUEST;
      customError.msg = `Invalid request; ${Object.values(err.errors)}`;
      break;
    case "MongoServerError":
      customError.statusCode = StatusCodes.BAD_REQUEST;
      customError.msg = "Email already exists, please signup with a new one";
      break;
    default:
      customError.statusCode =
        err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      customError.msg =
        err.message || "An error occured, please try again later";
      break;
  }
  res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = ErrorHandler;
