const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    image: {
      fileName: String,
      mimeType: String,
      url: String,
      size: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", ImageSchema);
