const express = require("express");
const authenticateToken = require("../middlewares/authentication");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

router.post("/sign-up-generate-otp", jsonParser, userController.sign_up_generate_otp);

router.post("/sign-up-resend-otp", jsonParser, userController.sign_up_resend_otp);

router.post("/sign-up-verify-otp", jsonParser, userController.sign_up_verify_otp);

router.post("/sign-in", jsonParser, userController.sign_in);

router.post("/forgot-password-otp", jsonParser, userController.forgot_password_otp);

router.post("/forgot-password-resend-otp", jsonParser, userController.forgot_password_resend_otp);

router.post("/forgot-password-verify-otp", jsonParser, userController.forgot_password_verify_otp);

router.get("/get-details", authenticateToken, jsonParser, userController.get_user_details);

router.get("/change-user", authenticateToken, userController.change_user_otp);

router.post("/change-user", authenticateToken, jsonParser, userController.change_user_verify);

router.get("/buy-all-status", authenticateToken, jsonParser, userController.get_buy_all_status);

router.get("/cart-total", authenticateToken, jsonParser, userController.get_cart_total_price);

router.get("/cart-count", authenticateToken, jsonParser, userController.get_cart_count);

router.post("/cart-count", authenticateToken, jsonParser, userController.update_cart_count);

router.get("/all-cart-items", authenticateToken, jsonParser, userController.get_all_cart_items);

router.post("/get-cart-details", authenticateToken, jsonParser, userController.get_cart_details);

router.post("/add-cart-details", authenticateToken, jsonParser, userController.add_cart_details);

router.delete("/cart-details", authenticateToken, jsonParser, userController.delete_cart_details);

router.post("/cart-quantity", authenticateToken, jsonParser, userController.update_cart_quantity);

router.get("/notifications", authenticateToken, jsonParser, userController.get_notifications);

router.post("/notifications", authenticateToken, jsonParser, userController.push_notifications);

router.post("/get-orders", authenticateToken, jsonParser, userController.get_orders);

router.post("/add-orders", authenticateToken, jsonParser, userController.add_orders);

router.delete("/orders", authenticateToken, jsonParser, userController.delete_orders);

router.get("/shop-orders", authenticateToken, jsonParser, userController.get_shop_orders);

router.post("/shop-orders", authenticateToken, jsonParser, userController.add_shop_orders);

router.delete("/shop-orders", authenticateToken, jsonParser, userController.delete_shop_orders);

router.post("/get-favourite-items", authenticateToken, jsonParser, userController.get_favourite_items);

router.post("/favourite-items", authenticateToken, jsonParser, userController.add_favourite_items);

router.delete("/favourite-items", authenticateToken, jsonParser, userController.delete_favourite_items);

router.get("/added-shops", authenticateToken, jsonParser, userController.get_added_shops);

router.post("/added-shops", authenticateToken, jsonParser, userController.add_to_added_shops);

router.delete("/added-shops", authenticateToken, jsonParser, userController.delete_added_shops);

router.get("/favourite-shops", authenticateToken, jsonParser, userController.get_favourite_shops);

router.post("/favourite-shops", authenticateToken, jsonParser, userController.add_favourite_shops);

router.delete("/favourite-shops", authenticateToken, jsonParser, userController.delete_favourite_shops);

module.exports = router;