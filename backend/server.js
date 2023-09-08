const express = require("express");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routers/userRouter");
const errorMidd = require("./middleWare/error");
const postRouter = require("./routers/postRouter");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
);
app.use(bodyParser.json());
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

const PORT = process.env.PORT || 5000;
app.use(errorMidd);
mongoose
  .connect(process.env.DB)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is runing on port :${PORT}`);
    });
  })
  .catch((e) => console.log(e));
