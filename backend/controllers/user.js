const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const genrateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETOKEN, {
    expiresIn: "1d",
  });
};
const userRegister = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !name || !password) {
    res.status(400);
    throw new Error("please fill a form");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be up to 6 character");
  }
  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    res.status(400);
    throw new Error("please write correct email format");
  }

  const emailExist = await User.findOne({ email });
  if (emailExist) {
    res.status(400);
    throw new Error("email has been existed");
  }
  const user = await User.create({ password, name, email });
  const token = genrateToken(user._id);
  if (user) {
    res.status(201);
    const { name, email, photo, bio, phone, permission } = user;
    res.cookie("token", token, {
      path: "/",
      httpOnly: false,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: false,
    });
    res.json({
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      token,
    });
  } else {
    res.status(500);
    throw new Error("error");
  }
});
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("please fill a form");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be up to 6 character");
  }
  if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    res.status(400);
    throw new Error("please write correct email format");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("user not found");
  }
  const token = genrateToken(user._id);
  res.cookie("token", token, {
    path: "/",
    httpOnly: false,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: false,
  });
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (user && passwordIsCorrect) {
    const { name, email, photo, bio, phone, permission } = user;
    res.json({
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      token,
    });
  } else {
    res.status(400);
    throw new Error("wrong password");
  }
});
const userLogout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: false,
    expires: new Date(0),
    sameSite: "none",
    secure: false,
  });
  return res.status(200).json({ message: "logout successfuly" });
});
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(user);
  if (user) {
    res.status(201);
    const {
      _id,
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      profilePicture,
      followers,
      followings,
      gender,
      dayOfBirth,
    } = user;
    res.json({
      _id,
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      profilePicture,
      followers,
      followings,
      gender,
      dayOfBirth,
    });
  } else {
    res.status(500);
    throw new Error("error");
  }
});
const getAnotherUser = asyncHandler(async (req, res) => {
  const user = await User.findById({ _id: req.params.id });
  if (user) {
    res.status(201);
    const {
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      profilePicture,
      followers,
      followings,
      gender,
      dayOfBirth,
    } = user;
    res.json({
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      profilePicture,
      followers,
      followings,
      gender,
      dayOfBirth,
    });
  } else {
    res.status(500);
    throw new Error("error");
  }
});
const loginStatus = (req, res) => {
  const token = req.cookies.token;
  if (!token) res.status(400).json(false);
  else {
    const verify = jwt.verify(token, process.env.JWT_SECRETOKEN);
    if (verify) res.status(200).json(true);
    else res.status(400).json(false);
  }
};
const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  (user.photo = req.body.photo || user.photo),
    (user.bio = req.body.bio || user.bio);
  user.phone = req.body.phone || user.phone;
  const { _id, name, email, photo, bio, phone, permission } = user;

  await User.findByIdAndUpdate(_id, req.user, {
    new: true,
    runValidators: true,
  })
    .then(
      res.json({
        name,
        email,
        photo,
        bio,
        phone,
        permission,
      })
    )
    .catch((e) => {
      res.status(500);
      throw new Error("error");
    });
});
const changePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id);
  const { oldPassword, password } = req.body;
  if (!oldPassword && !password) {
    res.status(400);
    throw new Error("enter your old password and your new password");
  }
  const verify = await bcrypt.compare(oldPassword, user.password);
  if (verify) {
    user.password = password;
    await user.save();
    res.status(200).send("update password successfully");
  } else {
    res.status(400);
    throw new Error("enter correct your old password");
  }
});
const sendTokenWhenForgotPass = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(404);
    throw new Error("please add email to the field");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(500);
    throw new Error("email not exist");
  }
  // console.log(user._id);
  await Token.findOneAndDelete({ userId: user._id });
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  let token = crypto.createHash("sha256").update(resetToken).digest("hex");
  console.log(resetToken);
  await new Token({
    userId: user._id,
    token: token,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000,
  })
    .save()
    .catch(() => {
      res.status(500);
      throw new Error("error");
    });
  const url = `${process.env.URL_RPASSWORD}/${resetToken}`;
  console.log(url);
  const subj = "RESET EMAIL";
  const message = `<h1>Reset password</h1>
      <br/>
      <p>this is link to reset password</p>
      <br/>
      <a href=${url}>${url}</a>`;
  try {
    await sendEmail(email, subj, message);
  } catch (error) {
    res.status(500);
    throw new Error("error");
  }
  res.send("reset password");
});
const changePasswordWhenForgotPass = asyncHandler(async (req, res) => {
  const { password, oldPassword } = req.body;
  const { resetToken } = req.params;
  let token = crypto.createHash("sha256").update(resetToken).digest("hex");
  const tokenDb = await Token.findOne({
    token,
    expiresAt: { $gt: Date.now() },
  });
  if (!tokenDb) {
    res.status(400);
    throw new Error("token had been expired");
  }

  const user = await User.findOne({ _id: tokenDb.userId });
  if (!user) {
    res.status(500);
    throw new Error("error");
  }
  const verify = await bcrypt.compare(oldPassword, user.password);
  if (verify) {
    user.password = password;
    await user.save();
    tokenDb.token = "";
    await tokenDb.save();
    res.status(200).json({ message: "change password successfully" });
  } else {
    res.status(400);
    throw new Error("enter correct your old password");
  }
});
const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  const user = await User.findOne({ _id: id });
  const currentUser = await User.findOne({ _id });
  if (id == _id) {
    if (!user.followers.includes(_id)) {
      try {
        await User.updateOne({ $push: { followers: _id } });
        await currentUser.updateOne({ $push: { followings: id } });
        res.status(200).send("Successfully following");
      } catch (error) {
        res.status(500);
        throw new Error("network error: ");
      }
    } else {
      res.status(403).send("you already follow this user");
    }
  } else {
    res.status(403).send("you cant follow your self");
  }
});
const unFollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  const user = await User.findOne({ _id: id });
  const currentUser = await User.findOne({ _id });
  if (id == _id) {
    if (user.followers.includes(_id)) {
      try {
        await User.deleteOne({ $pull: { followers: _id } });
        await currentUser.deleteOne({ $pull: { followings: id } });
        res.status(200).send("Successfully Unfollowing");
      } catch (error) {
        res.status(500);
        throw new Error("network error: ");
      }
    } else {
      res.status(403).send("you dont follow this user");
    }
  } else {
    res.status(403).send("you cant Unfollow your self");
  }
});
module.exports = {
  userRegister,
  userLogin,
  userLogout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  sendTokenWhenForgotPass,
  changePasswordWhenForgotPass,
  followUser,
  getAnotherUser,
  unFollowUser,
};
