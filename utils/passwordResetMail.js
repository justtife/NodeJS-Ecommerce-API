const sendMail = require("./sendMail");

const passwordResetMail = async ({ name, email, passwordToken }) => {
  const url = `http://localhost:5050/api/v1/reset-password?passwordToken=${passwordToken}`;
  const message = `
    <div style="display: flex; justify-content: center">
    
        <div style="border: 1px solid #555;border-radius: 5px;padding: 2vw 5vw 0.5em 5vw;color: #555;width: 80%;">
            <div class="head" style="border-bottom: 1px solid #555; padding-bottom: 10px">
              <a href="http://localhost:5000"
                ><img
                  src="https://i.postimg.cc/2jhpHL9B/Logo.png"
                  alt="teephaflowersandfabrics_logo"
                  width="100px"
                  style="display: block; margin: auto"
              /></a>
              <h2 style="text-align: center">Forgot Your Password?</h2>
              <p style="text-align: center"> ${email} </p>
            </div>
            <div class="body" style="padding-top: 10px">
              <h3>Dear, ${name}</h3>
              <p>
                Did you forget your password? No problem-click on the button below to change it now
              </p>
              <a
                href="${url}"
                style="
                  display: flex;
                  justify-content: center;
                  width: 50%;
                  margin: 30px auto;
                  letter-spacing: 5px;
                  padding: 10px 20px;
                  box-shadow: 5px 5px 3px #999;
                  border: 1px dashed #555;
                  font-size: 20px;
                  font-weight: bold;
                  text-decoration: none;
                  color: #555;
                "
                >Reset Your Password</a
              >
              <i style="display: block"
                ><small>***this link will expire in 5 minutes***</small></i
              >
            </div>
            <p>
              If you did not attempt to reset your password, please ignore this email and nothing will change
            </p>
            <p>
              Thanks, <br />
              Admin
            </p>
            <hr />
            <small>&copy; 2022 tflowersandfabrics.com</small>
          </div></div>`;
  return sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "ECommerce Password Reset",
    html: message,
  });
};

module.exports = passwordResetMail;
