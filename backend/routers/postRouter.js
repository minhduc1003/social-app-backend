const express = require("express");
const {
  postUpload,
  postDelete,
  getPost,
  likePost,
} = require("../controllers/post");
const { upload } = require("../utils/uploadFile");
const protect = require("../middleWare/authMiddleWare");
const router = express.Router;
router.post("/", protect, upload.single("image"), postUpload);
router.delete("/delete/:id", protect, postDelete);
router.get("/getPost/:id", protect, getPost);
router.put("/likes/:id", protect, likePost);
module.exports = router;
