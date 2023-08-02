const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const bannerController = require("../controllers/bannerController");

router.get("/", bannerController.get_banners);

module.exports = router;