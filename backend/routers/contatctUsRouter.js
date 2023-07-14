const express = require("express");
const contactUs = require("../controllers/contactUs");
const protect = require("../middleWare/authMiddleWare");
const router = express.Router();
router.post("/", protect, contactUs);
module.exports = router;
