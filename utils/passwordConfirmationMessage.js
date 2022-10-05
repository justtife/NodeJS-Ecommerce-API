const sendMail = require('./sendMail');

const passwordConfirmationMessage = async ({ email, date }) => {
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
              <h2 style="text-align: center">Your password has been changed</h2>
              <p style="text-align: center"> ${email} </p>
            </div>
            <div class="body" style="padding-top: 10px">
              <p>
                The password for your Teepha Flowers and Fabrics Customer account ${email} was changed on ${date}. If you didn't change it, you should 
                <a href="http://localhost:${process.env.APP_PORT}/password-recovery" style = "text-decoration: none;">recover your account</a> 
                or contact us via <a href="#" style="text-decoration: none;">mail</a>
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
    subject: "Your password has been changed",
    html: message,
  });
};
module.exports = passwordConfirmationMessage;
