const express = require("express");
const dotenv = require("dotenv").config();
const userRouter = require("./routers/userRouter");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorMidd = require("./middleWare/error");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());
app.use("/api/user", userRouter);
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
