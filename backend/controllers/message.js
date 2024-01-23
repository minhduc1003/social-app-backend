const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const addNewMessage = asyncHandler(async (req, res) => {
const newMessage = new Message(req.body);
  
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  })
const getMessage = asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({
        $and:[{conversationMember: {$in:[req.params.id1]}},{conversationMember: {$in:[req.params.id2]}}]
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  })
  module.exports = {
    addNewMessage,
    getMessage
  };