const express = require("express");
const {
  postUpload,
  postDelete,
  getPost,
  likePost,
  postImage,
  getPostIncludeFriend,
  commentsPost,
  sharePost,
  getPostById
} = require("../controllers/post");
const { upload } = require("../utils/uploadFile");
const protect = require("../middleWare/authMiddleWare");
const router = express.Router();
router.post("/upload/:id?", protect, postUpload);
router.post("/share/:id?", protect, sharePost);
router.delete("/delete/:id", protect, postDelete);
router.get("/getPost/:id", protect, getPost);
router.get("/getPostById/:id", protect, getPostById);
router.get("/getPostIncludeFriend", protect, getPostIncludeFriend);
router.get("/likes/:id", protect, likePost);
router.post("/comments", protect, commentsPost);
router.post("/image", protect, upload.single("image"), postImage);
module.exports = router;
