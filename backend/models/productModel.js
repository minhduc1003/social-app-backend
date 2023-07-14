const mongoose = require("mongoose");
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "user",
    },
    name: {
      type: String,
      require: [true, "please add a name"],
      trim: true,
    },
    sku: {
      type: String,
      default: "sku",
      require: true,
      trim: true,
    },
    category: {
      type: String,
      require: [true, "please add a category"],
      trim: true,
    },
    quantity: {
      type: String,
      require: [true, "please add a quantity"],
      trim: true,
    },
    price: {
      type: String,
      require: [true, "please add a price"],
      trim: true,
    },
    description: {
      type: String,
      require: [true, "please add a description"],
      trim: true,
    },
    image: {
      fileName: String,
      mimeType: String,
      url: String,
      size: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("product", productSchema);
module.exports = Product;
