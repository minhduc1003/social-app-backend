const router = require("express").Router();
const { addNewMessage,getMessage } = require("../controllers/message");
const protect = require("../middleWare/authMiddleWare");


//add

router.post("/",protect,addNewMessage );

//get

router.get("/:id1/:id2",protect, getMessage);

module.exports = router;
