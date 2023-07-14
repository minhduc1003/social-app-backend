const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormat } = require("../utils/uploadFile");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dbsywoofn",
  api_key: "299752882974997",
  api_secret: "h4s4gk1xCMBh21pa55F-3sLAXR8",
});
const postProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, description, image, price } = req.body;
  if (!name || !sku || !category || !quantity || !description || !price) {
    res.status(404);
    throw new Error("fill all section require");
  }
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
  try {
    await Product.create({
      name,
      sku,
      category,
      quantity,
      description,
      image: fileData,
      price,
      user: req.user._id,
    });
    res.status(201).json("create your product successfully");
  } catch (error) {
    res.status(500);
    throw new Error("error");
  }
});
const getAllProduct = asyncHandler(async (req, res) => {
  const product = await Product.find({});
  if (product) {
    res.status(200).json([...product]);
  } else {
    res.status(500);
    throw new Error("error");
  }
});
const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id });
  if (req.user.permission !== process.env.ADMIN_PERMISSION) {
    if (!product.user.equals(req.user._id)) {
      res.status(404);
      throw new Error("you can't get this product");
    }
  }
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(500);
    throw new Error("error");
  }
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id });
  if (req.user.permission !== process.env.ADMIN_PERMISSION) {
    if (!product.user.equals(req.user._id)) {
      res.status(404);
      throw new Error("you can't get this product");
    }
  }
  if (product) {
    await Product.findOneAndDelete({ _id: id });
    res.status(200).json("delete product successfully");
  } else {
    res.status(500);
    throw new Error("error");
  }
});
const updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, description, price } = req.body;
  const { id } = req.params;
  let fileData = {};
  const product = await Product.findOne({ _id: id });

  if (req.user.permission != process.env.ADMIN_PERMISSION) {
    if (!product.user.equals(req.user._id)) {
      res.status(404);
      throw new Error("you can't get this product");
    }
  }

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
  const updateProduct = await Product.findOneAndUpdate(
    { _id: id },
    {
      name,
      sku,
      category,
      quantity,
      description,
      image: Object.keys(fileData).length === 0 ? product.image : fileData,
      price,
    },
    {
      new: true,
      runValidation: true,
    }
  );
  if (product) {
    res.status(200).json("update product successfully");
  } else {
    res.status(500);
    throw new Error("error");
  }
});
module.exports = {
  postProduct,
  getAllProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
};
