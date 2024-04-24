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
const messageRouter = require("./routers/messageRouter");
const app = express();
const fs = require("fs");
const options = {
  key: fs.readFileSync("./certificate/key.pem"),
  cert: fs.readFileSync("./certificate/cert.pem"),
};
const https = require("https");
const { Server } = require("socket.io");
const server = https.createServer(options, app);
const io = new Server(server);

// global._io = io;
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  console.log(users);
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // console.log(`a user connected id: ${socket.id}`);
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on(
    "send_message",
    ({ senderId, receiverId, text, conversationMember }) => {
      const user = getUser(receiverId);
      console.log(user);
      if (user && user.socketId) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
          conversationMember,
        });
      }
    }
  );
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("user disconnected");
    io.emit("getUsers", users);
  });
});
app.use((req, res, next) => {
  res.io = io;
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});
app.use(bodyParser.json());
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/message", messageRouter);

const PORT = process.env.PORT || 5000;
app.use(errorMidd);
mongoose
  .connect(process.env.DB)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server is runing on port :${PORT}`);
    });
  })
  .catch((e) => console.log(e));
