const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const contactController = require("../controllers/contactController");
const authenticateToken = require("../middlewares/authentication");

router.post("/send", authenticateToken, jsonParser, contactController.send_message);

module.exports = router;