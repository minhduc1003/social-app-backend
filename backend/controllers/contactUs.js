const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    res.status(404);
    throw new Error("Please provide subject and message");
  }
  const html = `<h1>${subject}</h1>
  <br/>
  <p>user send: ${req.user.email}</p>
  <br/>
  <p>${message}</p>
  `;
  try {
    await sendEmail(process.env.EMAIL_USER, subject, html, req.user.email);
    res.status(200).json("send message successfully");
  } catch (error) {
    res.status(500);
    throw new Error("Couldn't send message");
  }
});
module.exports = contactUs;
