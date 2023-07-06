const express = require("express");
const dotenv = require("dotenv").config();
const userRouter = require("./routers/userRouter");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use("/api/user", userRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.DB)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is runing on port :${PORT}`);
    });
  })
  .catch((e) => console.log(e));
