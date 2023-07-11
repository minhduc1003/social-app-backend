const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("please login");
    }
    const vertify = jwt.verify(token, process.env.JWT_SECRETOKEN);
    const user = await User.findOne({ _id: vertify.id }).select("-password");
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("please login");
  }
});
module.exports = protect;
