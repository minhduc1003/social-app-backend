const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const Image = require("../models/imageModel");
const { fileSizeFormat } = require("../utils/uploadFile");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dbsywoofn",
  api_key: "299752882974997",
  api_secret: "h4s4gk1xCMBh21pa55F-3sLAXR8",
});
const postImage = asyncHandler(async (req, res) => {
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
    const image = await Image.create({ image: fileData, userId: req.user._id });
    res.status(200).json({
      imageId: image._id,
    });
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});

const postUpload = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.params;
    const image = id && (await Image.findById(id));
    if (id) {
      await Post.create({ text, image: image.image, userId: req.user._id });
    } else {
      await Post.create({ text, userId: req.user._id });
    }
    res.status(200).send("Successfully posted!");
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const postDelete = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findOneAndDelete({ _id: id });
    res.status(200).send("Successfully deleted!");
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const getDashboardPost = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const data = await Post.find({ userId: _id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const getPost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await Post.find({ userId: id });
    res.status(200);
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const likePost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const findPost = await Post.findOne({ _id: id });
    if (!findPost.likes.includes(req.user._id)) {
      findPost.updateOne({ $push: { likes: req.user._id } });
    } else {
      findPost.updateOne({ $pull: { likes: req.user._id } });
    }
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
module.exports = {
  postUpload,
  postDelete,
  getPost,
  likePost,
  postImage,
  getDashboardPost,
};
