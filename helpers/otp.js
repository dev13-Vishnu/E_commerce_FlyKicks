const generate_otp = require("otp-generator");
const nodemailer = require("nodemailer");

require("dotenv").config();

const generate = () => {
  const otp = generate_otp.generate(4, {
    length: 4,
    digits: true,
    // upperCaseAlphabets: false,
    // lowerCasealphabets: false,
    // specialChars: false,
    upperCaseAlphabets:false,
    lowerCaseAlphabets: false,
    specialChars: false
  });
  return otp;
};

const sendOtp = (email, otp) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user:process.env.Email,
        pass:  process.env.Password,
      },
    });

    const mailOption = {
      from: 'devmail.required@gmail.com',
      to: email,
      subject: "OTP for verification",
      text: ` ${otp} this is your OTP for verification`,
    };
    transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.log("error from helper > OTP > sendOtp", err.message);
        reject(err);
      } else {
        console.log("Email sent:" + info.response);
        resolve(info);
      }
    });
  });
};

module.exports = {
  generate,
  sendOtp,
};
