const sequelize = require("sequelize");
const connectionConfig = require("../config/database/connection");
const nodemailer = require("nodemailer");

const SERVICE = {
  async sendEmailVerification(email, random) {
    const output = `
        <p>Your verification mail is ${random}</p>
    `;
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "Ucheobikingsley@gmail.com", // generated ethereal user
        pass: "Program10" // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"TalkCash" <Ucheobikingsley@gmail.com>', // sender address
      to: `${email}`, // list of receivers
      subject: "Verification Email", // Subject line
      text: "Hello world?", // plain text body
      html: output // html body
    });

    if (info) {
      return info;
    }
    return info;
  }
};

module.exports = { SERVICE };
