const express = require("express");
const {
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
  unFollowUser,
  getAnotherUser,
  searchUser,
  unAcceptNewFriend,
  acceptNewFriend,
} = require("../controllers/user");
const protect = require("../middleWare/authMiddleWare");
const router = express.Router();
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/logout", userLogout);
router.get("/getUser", protect, getUser);
router.get("/getAnotherUser/:id", protect, getAnotherUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", sendTokenWhenForgotPass);
router.put("/forgotpassword/:resetToken", changePasswordWhenForgotPass);
router.get("/follow/:id", protect, followUser);
router.get("/unFollow/:id", protect, unFollowUser);
router.get("/search",protect,searchUser);
router.get("/accept/:id", protect, acceptNewFriend);
router.get("/unAccept/:id", protect, unAcceptNewFriend);
module.exports = router;
