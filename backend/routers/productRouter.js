const express = require("express");
const {
  postProduct,
  getAllProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/product");
const protect = require("../middleWare/authMiddleWare");
const { upload } = require("../utils/uploadFile");
const router = express.Router();
router.post("/", protect, upload.single("image"), postProduct);
router.get("/allproduct", protect, getAllProduct);
router.get("/singleproduct/:id", protect, getSingleProduct);
router.delete("/deleteproduct/:id", protect, deleteProduct);
router.put(
  "/updateproduct/:id",
  protect,
  upload.single("image"),
  updateProduct
);
module.exports = router;
