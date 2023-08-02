const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const authenticateToken = require("../middlewares/authentication");
const paymentController = require("../controllers/paymentController");

router.get("/key", paymentController.get_razorpay_key);

router.post("/order-id", authenticateToken, jsonParser, paymentController.get_order_id);

router.post("/verify", authenticateToken, jsonParser, paymentController.payment_verification);

module.exports = router;