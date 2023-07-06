const express = require("express");
const { userRegister } = require("../controllers/user");
const router = express.Router();
router.post("/register", userRegister);
module.exports = router;
