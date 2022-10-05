const { StatusCodes } = require("http-status-codes");
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
  static BadRequestError(msg) {
    return new CustomError(msg, StatusCodes.BAD_REQUEST);
  }
  static NotFoundError(msg) {
    return new CustomError(msg, StatusCodes.NOT_FOUND);
  }
  static UnauthorizedError(msg) {
    return new CustomError(msg, StatusCodes.UNAUTHORIZED);
  }
}

module.exports = CustomError;
