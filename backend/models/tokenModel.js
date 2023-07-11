const mongoose = require("mongoose");
const tokenSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: [true, "require"],
    ref: "user",
  },
  token: {
    type: String,
    require: [true, "require"],
  },
  createdAt: {
    type: Date,
    require: [true, "require"],
  },
  expiresAt: {
    type: Date,
    require: [true, "require"],
  },
});
const Token = mongoose.model("token", tokenSchema);
module.exports = Token;
