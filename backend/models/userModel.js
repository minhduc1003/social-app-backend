const mongoose = require("mongoose");
const bycript = require("bcrypt");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "require"],
    },
    email: {
      type: String,
      required: [true, "require"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "require"],
      minLength: [6, "please fill up to 6 characters"],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      default: "https://www.catholicjonesboro.com/files/images/sample-img.jpg",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    phone: {
      type: Number,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    dayOfBirth: {
      type: Date,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxLength: [250, "please fill not more than 250 characters"],
    },
    permission: {
      type: String,
      default: process.env.USER_PERMISSION,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bycript.genSalt(10);
  const hashPassword = await bycript.hash(this.password, salt);
  this.password = hashPassword;
});
const User = mongoose.model("user", userSchema);
module.exports = User;
