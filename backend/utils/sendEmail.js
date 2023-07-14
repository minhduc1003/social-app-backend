const nodemailer = require("nodemailer");
const sendEmail = async (email_to, email_subj, email_html, email_replyTo) => {
  const transport = nodemailer.createTransport(
    {
      host: process.env.EMAIL_HOST,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    {
      tls: {
        rejectUnauthorized: false,
      },
    }
  );
  const option = {
    from: process.env.EMAIL_USER,
    to: email_to,
    subject: email_subj,
    html: email_html,
    replyTo: email_replyTo,
  };
  transport.sendMail(option, function (err, info) {
    if (err) {
      console.log(err);
    }
    console.log(info);
  });
};
module.exports = sendEmail;
