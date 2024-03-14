const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const mongoose = require('mongoose');
const { fileSizeFormat } = require("../utils/uploadFile");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dbsywoofn",
  api_key: "299752882974997",
  api_secret: "h4s4gk1xCMBh21pa55F-3sLAXR8",
});
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
    const {_id, name, email, photo, bio, phone, permission, friend,notification,
      gender,
      dayOfBirth} = user;
    res.cookie("token", token, {
      path: "/",
      httpOnly: false,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: false,
    });
    res.json({
      _id,
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      token,
      friend,
      notification,
      gender,
      dayOfBirth,
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
    const { _id,name, email, photo, bio, phone, permission, friend,notification,
      gender,
      dayOfBirth} = user;
    res.json({
      _id,
      name,
      email,
      photo,
      bio,
      phone,
      permission,
      token,
      friend,
      notification,
      gender,
      dayOfBirth,
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
      notification,
      friend,
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
      notification,
      friend,
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
      notification,
      friend,
      gender,
      dayOfBirth,
      _id,
      location,
      web,
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
      notification,
      friend,
      gender,
      dayOfBirth,
      location,
      web,
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
    (user.bio = req.body.bio );
  user.phone = req.body.phone ;
  user.dayOfBirth = req.body.dayOfBirth ;
  (user.location = req.body.location ),
    (user.web = req.body.web );
  user.gender = req.body.gender ;
  const { _id, name, email, photo, bio, phone, permission,dayOfBirth,location,web,gender } = user;

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
        dayOfBirth,
        location,
        web,
        gender
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
  await Token.findOneAndDelete({ userId: user._id });
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  let token = crypto.createHash("sha256").update(resetToken).digest("hex");
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
  const io = res.io;
  const currentId = _id.toString();
  if (id !== _id) {
    if (!user.friend.some(user => user.userId===currentId)) {
      try {
        await currentUser.updateOne({ $push: { friend: {
          name:currentUser.name,
          image:currentUser.photo,
          userId:id,
          status:"Pending"
        } } });
        await user.updateOne({ $push: { notification: {
          des:"add friend",
          name: user.name,
          image: user.photo,
          userId:_id.toString(),
          createdAt:Date.now()
        } } });  
        io.emit("sent_notification")     
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
const unAcceptNewFriend = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  const userId = _id.toString()
  const currentUser = await User.findOne({ _id });
  
      try {
        await currentUser.updateOne({ $pull: { notification: {userId:id} } });
        res.status(200).send("Successfully following");
      } catch (error) {
        res.status(500);
        throw new Error("network error: ");
      }
    
});
const acceptNewFriend = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  const user = await User.findOne({ _id: id });
  const currentUser = await User.findOne({ _id });
  const userId = _id.toString()
  io= res.io;
  if (id !== userId) {
    if (user.friend.some(user => user.userId===userId)) {
      try {
        await user.updateOne({ $pull: { friend: {status:"Pending"} } });
        await user.updateOne({ $push: { friend: {
          name:currentUser.name,
          image:currentUser.photo,
          userId:userId,
          status:"Accepted"
        } } });
        await currentUser.updateOne({ $push: { friend: {
          name:user.name,
          image:user.photo,
          userId:id,
          status:"Accepted"
        }  } });
        io.emit("sent_Accepted")
        await currentUser.updateOne({ $pull: { notification: {userId:id} } });
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
  const userId = _id.toString()
  if (id !== userId) {
    if (user.friend.some(user => user.userId===userId)) {
      try {
        await user.updateOne({ $pull: { friend: {userId:userId} } });
        await currentUser.updateOne({ $pull: { friend: {userId:id} } });
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
const searchUser = asyncHandler(async (req, res) => {
  const { name } = req.query;
  const currentUser = await User.findOne({_id:req.user._id})
  if(name!==""){
    const users = await User.find({$and:[
      { name: { $regex: name, $options: "i" }},
       {_id:{$ne: currentUser}}
    ]});
if (users.length>0){
  res.status(200).json(users);
}else{
  res.status(200).json([]);
}
  }else{
    res.status(200).json([]);
  }
})
const postImageBackground = asyncHandler(async (req, res) => {
  try {
    let fileData = {};
    if (req.file) {
      let upload;
      try {
        upload = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "image",
        });
        fileData = {
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          url: upload.secure_url,
          size: fileSizeFormat(req.file.size, 2),
        };
      } catch (error) {
        res.status(500);
        throw new Error("upload image error");
      }
    }
    const image = await User.findOneAndUpdate(
      {_id: req.user._id},
      {profilePicture: fileData.url},
      {new: true}
    )
    res.status(200).json(image)
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const postImagePhoto = asyncHandler(async (req, res) => {
  try {
    let fileData = {};
    if (req.file) {
      let upload;
      try {
        upload = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "image",
        });
        fileData = {
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          url: upload.secure_url,
          size: fileSizeFormat(req.file.size, 2),
        };
      } catch (error) {
        res.status(500);
        throw new Error("upload image error");
      }
    }
    const image = await User.findOneAndUpdate(
      {_id: req.user._id},
      {photo: fileData.url},
      {new: true}
    )
     await User.findOneAndUpdate(
      {'friend.userId':req.user._id.toString()},
      { $set: { 'friend.$.image': fileData.url } },
      {new: true}
    )
    res.status(200).json(image)
  } catch (error) {
    res.status(500);
    throw new Error("network error");
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
  searchUser,
  unAcceptNewFriend,
  acceptNewFriend,
  postImageBackground,
  postImagePhoto
};
