const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authentication");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const itemController = require("../controllers/itemController");
const checkToken = require("../middlewares/checkToken");

router.post("/add", authenticateToken, jsonParser, itemController.add_item);

router.post("/change-name", authenticateToken, jsonParser, itemController.change_name);

router.post("/change-category", authenticateToken, jsonParser, itemController.change_category);

router.post("/change-image", authenticateToken, jsonParser, itemController.change_image);

router.post("/change-count", authenticateToken, jsonParser, itemController.change_count);

router.post("/change-price", authenticateToken, jsonParser, itemController.change_price);

router.post("/change-discount-price", authenticateToken, jsonParser, itemController.change_discount_price);

router.post("/change-description", authenticateToken, jsonParser, itemController.change_description);

router.post("/change-table-details", authenticateToken, jsonParser, itemController.change_tableDetails);

router.post("/increment-sales", authenticateToken, jsonParser, itemController.increment_sales);

router.delete("/delete", authenticateToken, jsonParser, itemController.delete_item);

router.post("/by-shop", authenticateToken, jsonParser, itemController.get_by_shopID);

router.post("/autocomplete", jsonParser, itemController.autocomplete_suggestions);

router.post("/search-results",checkToken, jsonParser, itemController.get_search_results);

router.post("/top", checkToken, jsonParser, itemController.get_top_items);

router.post("/details", jsonParser, itemController.get_item_details);

router.post("/by-category", checkToken, jsonParser, itemController.get_by_categoryID);

router.post("/popular", checkToken, jsonParser, itemController.get_popular_items);

router.post("/push-comment", authenticateToken, jsonParser, itemController.push_comment);

router.post("/get-comment", jsonParser, itemController.get_comment);

module.exports = router;