const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authentication");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const categoryController = require("../controllers/categoryController");

router.post("/add", jsonParser, categoryController.add_category);

router.post("/increment-sales", authenticateToken, jsonParser, categoryController.increment_sales);

router.get("/all", jsonParser, categoryController.get_all_categories);

router.post("/top", jsonParser, categoryController.get_top_categories);

router.post("/banner", jsonParser, categoryController.get_banner);

module.exports = router;