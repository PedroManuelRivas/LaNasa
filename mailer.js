const nodemailer = require("nodemailer");

const enviarCorreo = (to, subject, html) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nodemailerADL@gmail.com",
      pass: "desafiolatam",
    },
  });

  let mailOptions = {
    from: "nodemailerADL@gmail.com",
    to,
    subject,
    html,
  };
  const enviar = transporter.sendMail(mailOptions);
  return enviar;
};

module.exports = enviarCorreo;
