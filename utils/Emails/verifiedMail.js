const sendMail = require("../sendMail");

const verifiedMail = async ({ name, email }) => {
  const url = `http://localhost:${process.env.APP_PORT}/api/v1/login`;
  const message = `
    <div style="display: flex; justify-content: center">
    
        <div style="border: 1px solid #555;border-radius: 5px;padding: 2vw 5vw 0.5em 5vw;color: #555;width: 80%;">
            <div class="head" style="border-bottom: 1px solid #555; padding-bottom: 10px">
              <a href="http://localhost:${process.env.APP_PORT}"
                ><img
                  src="https://i.postimg.cc/2jhpHL9B/Logo.png"
                  alt="teephaflowersandfabrics_logo"
                  width="100px"
                  style="display: block; margin: auto"
              /></a>
              <h2 style="text-align: center">Email Verified</h2>
            </div>
            <div class="body" style="padding-top: 10px">
              <h3>Hello, ${name}</h3>
              <p>
              Thank you for verifing your account.
              </p>
              <p>
                You can now proceed to login <a href= "${url}">here</a>
              </p>
              
            </div>
            <p>
              Thanks, <br />
              Admin
            </p>
            <hr />
            <small>&copy; 2022 justtife.com</small>
          </div></div>`;
  return sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Email Verified",
    html: message,
  });
};
module.exports = verifiedMail;
