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
      console.log(req.file);
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
    const { text,share } = req.body;
    const { id } = req.params;
    const image = id && (await Image.findById(id));
    if (id) {
      await Post.create({ text, image: image.image, userId: req.user._id });
    } else if(share){
      await Post.create({ text, share: share, userId: req.user._id });
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
const getPost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Post.find({ userId: id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const getPostById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Post.find({ _id: id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const getPostIncludeFriend = asyncHandler(async (req, res) => {
  try {
    const { friend,_id } = req.user;
    const userId = [];
    userId.push(_id);
    friend && friend.map(item=>{
      userId.push(item.userId);
    })
    const data = await Post.find({ userId: {$in:userId} });
    res.status(200).json(data);
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
})
const likePost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const findPost = await Post.findOne({ _id: id });
    if (!findPost.likes.includes(req.user._id)) {
      const updatedPost = await Post.findOneAndUpdate(
        { _id: id },
        { $push: { likes: req.user._id } },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } else {
      const updatedPost = await Post.findOneAndUpdate(
        { _id: id },
        { $pull: { likes: req.user._id } },
        { new: true }
      );
      res.status(200).json(updatedPost);
    }
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const commentsPost = asyncHandler(async (req, res) => {
  try {
    const { id,text,user } = req.body;
    const commentsPost = await Post.findOneAndUpdate(
      { _id: id },
      { $push: { comments: {
        text:text,
        user:user,
        reply:[]
      } } },
      { new: true }
    );
    res.status(200).json(commentsPost);
  } catch (error) {
    res.status(500);
    throw new Error("network error");
  }
});
const sharePost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const findPost = await Post.findById(id);
     const rs = await Post.create({ share:findPost,userId: req.user._id  });
    res.status(200).json(rs);
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
  getPostIncludeFriend,
  commentsPost,
  sharePost,
  getPostById
};
