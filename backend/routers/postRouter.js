const express = require("express");
const {
  postUpload,
  postDelete,
  getPost,
  likePost,
  postImage,
} = require("../controllers/post");
const { upload } = require("../utils/uploadFile");
const protect = require("../middleWare/authMiddleWare");
const router = express.Router();
router.post("/upload/:id?", protect, postUpload);
router.delete("/delete/:id", protect, postDelete);
router.get("/getPost/:id", protect, getPost);
router.put("/likes/:id", protect, likePost);
router.post("/image", protect, upload.single("image"), postImage);
module.exports = router;
