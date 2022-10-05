const { sign, verify } = require("jsonwebtoken");
//Create Token
const createJWT = ({ payload }) => {
  const token = sign(payload, process.env.JWT_SECRET);
  return token;
};

//Verify Existing Token
const verifyToken = (token) => {
  return verify(token, process.env.JWT_SECRET);
};

//Attach Cookies To Response
const attachCokieToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });
  const fiftenMinutes = 15 * 60 * 1000;
  const twelveHours = 12 * 60 * 60 * 1000;
  //Access Token
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + fiftenMinutes),
    secure: process.env.NODE_ENV === "production",
  });
  //Refresh Token

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + twelveHours),
    secure: process.env.NODE_ENV === "production",
  });
};
module.exports = {
  createJWT,
  verifyToken,
  attachCokieToResponse,
};
