const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const userRegister = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !name || !password) {
    res.status(400);
    throw new Error("please fill a form");
  }
  if (password < 6) {
    res.status(400);
    throw new Error("password must be up to 6 character");
  }

  const emailExist = await User.findOne({ email });
  if (emailExist) {
    res.status(400);
    throw new Error("email has been existed");
  }
  const user = await User.create({ password, name, email });
  if (user) {
    res.status(201);
    const { name, email, photo, bio, phone } = user;
    res.json({
      name,
      email,
      photo,
      bio,
      phone,
    });
  } else {
    res.status(500);
    throw new Error("error");
  }
});
module.exports = {
  userRegister,
};
