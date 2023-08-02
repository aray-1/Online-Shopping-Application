require("dotenv").config();
const crypto = require("crypto");
const User = require("../models/user");
const OTP = require("../models/otp");
const Item = require("../models/item");
const otpGenerator = require("otp-generator");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const utilities = require("../utility-functions");

const jwtExpireTime = 21600;
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.SMTP_PASSWORD
    }
});

function hash(data){
    const hmac = crypto.createHmac("sha256", process.env.PASSWORD_HASH_SECRET_KEY);
    return hmac.update(data).digest("hex");
}

function generateOTP(length){
    const otpOptions = {
        digits : true,
        lowerCaseAlphabets : false,
        upperCaseAlphabets : false,
        specialChars : false
    }
    const otp = otpGenerator.generate(length, otpOptions);

    return otp;
}

function getOTPHTML(otp, header, purpose){
    const otpHTML = `<div style="width: 500px; background-color: white; border: 1px solid rgba(0, 0, 0, 0.5); margin: 0px auto;border-radius: 5px; box-sizing: border-box; box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.5);">
                        <div style="width: 100%; font-size: 2rem; font-weight: bold; color: #FFFFFF; background-color: rgb(0, 100, 255); padding: 15px; border-radius: 5px 5px 0px 0px; box-sizing: border-box;">
                            ${header}
                        </div>
                        <div style="width: 100%; font-size: 1.2rem; padding: 10px 15px; box-sizing: border-box;">
                            Dear Customer,
                        </div>
                        <div style="width: 100%; padding: 0px 15px; font-size: 1.1rem; box-sizing: border-box;">
                            We received a request for ${purpose} on our website, RayMart. To proceed, verify your email using this verification OTP.
                        </div>
                        <div style="width: 100%; padding: 15px 0px; font-size: 3rem;text-align: center; box-sizing: border-box; user-select: none;">
                            ${otp}
                        </div>
                        <div style="width: 100%; padding: 10px 15px 30px 15px; font-size: 1.1rem; box-sizing: border-box;">
                            If you did not request this code, it is possible that someone else is trying to use your email. <span style="font-weight: bold;">Do not forward or give this code to anyone.</span>
                        </div>
                    </div>`
    return otpHTML;
}

function sendEmail(email, subject, otp, header, purpose){
    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: subject,
        text: "",
        html: getOTPHTML(otp, header, purpose)
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log(error);
            throw Error("There was error sending OTP to your email");
        }
        else{
            console.log('Email sent: ' + info.response);
            res.status(201).json({message : "Verification Email Sent"});
        }
    });
}

async function saveOTP(email, otp){
    return new Promise((resolve, reject)=>{
        const newOtp = new OTP({
            Email : email,
            OTP : otp
        });
        newOtp.save()
        .then((result)=>{
            resolve();
        })
        .catch((err)=>{
            reject(err);
        })
    });
}

async function verifyOTP(userOTP, email){
    return new Promise(async (resolve, reject)=>{
        const currentTime = new Date();
        const databaseOTP = await OTP.findOne({Email : email, OTP : userOTP});
        
        const timeDifference = databaseOTP ? currentTime - databaseOTP.createdAt : 0;
        console.log(timeDifference);

        if(timeDifference > 180000){
            await OTP.deleteOne({Email : email, OTP : databaseOTP.OTP});
            reject("OTP Timed Out");
        }
        if(!databaseOTP) reject({message : "Wrong OTP Entered"});
        resolve();
    });
}

const sign_up_generate_otp = async (req, res)=>{
    try{
        if(!("email" in req.body)) throw Error("email not found in request body");
        if(!("userName" in req.body)) throw Error("userName not found in request body");
        if(!("password" in req.body)) throw Error("password not found in request body");

        const email = req.body.email;
        const userName = req.body.userName;
        const password = req.body.password;

        const hashedPassword = hash(password);
        const existingUser = await User.findOne({UserName : userName, Password : hashedPassword});
        const existingUserEmail = await User.findOne({Email : email});

        if(existingUser) throw Error("User with this Username And Password already exists");
        else if(existingUserEmail) throw Error("User with this email already exists");

        // generate OTP
        const otp = generateOTP(6);
        console.log(otp);
        
        // delete any existing OTP
        const existingOTP = await OTP.findOne({Email : email});
        if(existingOTP) await OTP.deleteOne({Email : email});
        
        // save new OTP in Database
        await saveOTP(email, otp);

        // send otp in mail
        sendEmail(email, "Email Verification", otp, "Email Verification", "<span style=\"font-weight: bold;\">creating an account</span>");

        res.status(200).json({message : "Verification Email Sent"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const sign_up_resend_otp = async (req, res)=>{
    try {
        const email = req.body.email;
    
        // delete existing otp
        const existingOTP = await OTP.findOne({Email : email});
        if(existingOTP) await OTP.deleteOne({Email : email});

        // generate new OTP
        const otp = generateOTP(6);
        console.log(otp);

        // save new otp in database
        await saveOTP(email, otp);
    
        // send new otp in email
        sendEmail(email, "Email Verification", otp, "Email Verification", "<span style=\"font-weight: bold;\">creating an account</span>");

        res.status(200).json({message : "Verification Email Sent"});
    }
    catch (error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const sign_up_verify_otp = async (req, res)=>{
    try {
        const userOTP = req.body.userOTP;
        const userName = req.body.userName;
        const password = req.body.password;
        const email = req.body.email;
        
        // verify the OTP
        await verifyOTP(userOTP, email);

        // delete OTP after verification and create new user
        OTP.deleteOne({Email : email, OTP : userOTP})
        .then((result)=>{
            const hashedPassword = hash(password);

            const user = new User({
                Email : email,
                UserName : userName,
                Password : hashedPassword,
                CartCount : 0,
                CartDetails : [],
                Notifications : [],
                Orders : [],
                FavouriteItems : [],
                AddedShops : [],
                FavouriteShops : []
            });

            user.save()
            .then((result)=>{
                res.status(201).json({message : "Your Email Has Been Verified"});
            })
            .catch((err)=>{
                console.log(err);
                throw Error("Email Verification Failed. Retry.");
            })
        })
        .catch((err)=>{
            console.log(err);
            throw Error("Email Verification Failed. Retry.");
        })
    }
    catch(error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const sign_in = async (req, res)=>{
    try {
        const userName = req.body.userName;
        const password = req.body.password;

        const hashedPassword = hash(password);
        const user = await User.findOne({UserName : userName, Password : hashedPassword});
        
        if(!user) throw Error("Invalid Username/Password");

        const accessToken = jwt.sign({Email : user.Email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : jwtExpireTime});

        res.status(200).json({accessToken, email : user.Email});
    }
    catch (error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const forgot_password_otp = async (req, res)=>{
    try {
        const email = req.body.email;

        // checking if user with given email exists
        const user = await User.findOne({Email : email});
        if(!user) throw Error("Wrong Email Entered");
    
        // delete existing otp
        const existingOTP = await OTP.findOne({Email : email});
        if(existingOTP) await OTP.deleteOne({Email : email});
    
        // generate new OTP
        const otp = generateOTP(6);
        console.log(otp);
    
        // save new otp in database
        await saveOTP(email, otp);
    
        // send new otp in email
        sendEmail(email, "Forgot Password", otp, "Forgot Password", "<span style=\"font-weight: bold;\">Forgot Password</span>");

        res.status(200).json({message : "Verification Email Sent"});
    }
    catch(error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const forgot_password_resend_otp = async (req, res)=>{
    try {
        const email = req.body.email;
    
        // delete existing otp
        const existingOTP = await OTP.findOne({Email : email});
        if(existingOTP) await OTP.deleteOne({Email : email});

        // generate new OTP
        const otp = generateOTP(6);
        console.log(otp);

        // save new otp in database
        await saveOTP(email, otp);
    
        // send new otp in email
        sendEmail(email, "Forgot Password", otp, "Forgot Password", "<span style=\"font-weight: bold;\">forgot password</span>");

        res.status(200).json({message : "Verification Email Sent"});
    }
    catch (error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const forgot_password_verify_otp = async (req, res)=>{
    try {
        const userOTP = req.body.userOTP;
        const email = req.body.email;
        
        await verifyOTP(userOTP, email);

        const accessToken = jwt.sign({Email : email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : jwtExpireTime});
        const user = await User.findOne({Email : email});

        OTP.deleteOne({Email : email, OTP : userOTP})
        .then((result)=>{
            res.status(201).json({
                accessToken : accessToken,
                userName : user.UserName,
                password : ""
            });
        })
        .catch((err)=>{
            console.log(err);
            throw Error("Email Verification Failed. Retry.");
        })
    } 
    catch(error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_user_details = async (req, res)=>{
    try{
        const email = req.email;
        const user = await User.findOne({Email : email});
        if(!user) throw Error("User Not Available");

        const userDetails = {
            email : email,
            userName : user.UserName,
            password : user.Password
        }
        res.status(200).json({ userDetails });
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_user_otp = async (req, res)=>{
    try{
        const email = req.email;
        const user = await User.findOne({Email : email});
        if(!user) throw Error("Wrong Email Entered");
    
        const existingOTP = await OTP.findOne({Email : email});
        if(existingOTP) await OTP.deleteOne({Email : email});
    
        const otp = generateOTP(6);
        console.log(otp);
    
        await saveOTP(email, otp);
    
        sendEmail(email, "Profile Change - RayMart", otp, "Profile Change", "<span style=\"font-weight: bold;\">Profile Change</span>");

        res.status(200).json({message : "Verification Email Sent"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_user_verify = async (req, res)=>{
    try{
        if(!("userOTP" in req.body)) throw Error("userOTP not found in request body");
        if(!("userName" in req.body)) throw Error("userName not found in request body");
        if(!("password" in req.body)) throw Error("password not found in request body");
        
        const email = req.email;
        const userOTP = req.body.userOTP;
        const userName = req.body.userName;
        const password = req.body.password;

        await verifyOTP(userOTP, email);
        await OTP.deleteOne({Email : email, OTP : userOTP});

        await User.updateOne({Email : email}, {UserName : userName, Password : hash(password)});

        res.status(501).json({message : "Profile Changed Succesfully"});
    }
    catch(err){
        console.log(err.message);
        res.staus(501).json({errorMessage : err.message});
    }
}

const get_buy_all_status = async (req, res)=>{
    try{
        const email = req.email;
        const cart = await User.findOne({Email : email}).select("CartDetails");
        const itemIDs = cart.CartDetails.map(item=>item.ItemID);

        let itemQuantities = {};
        for(let i=0;i<cart.CartDetails.length;i++){
            itemQuantities[cart.CartDetails[i].ItemID] = cart.CartDetails[i].ItemQuantity;
        }

        const items = await Item.find({ItemID : {$in : itemIDs}}).select("ItemCount ItemID");

        let buyState = true;
        for(let i=0;i<items.length; i++){
            if(items[i].ItemCount === 0 || itemQuantities[items[i].ItemID] > items[i].ItemCount) buyState = false;
        }

        res.status(200).json({buyAllStatus : buyState});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_cart_total_price = async (req, res)=>{
    try{
        const email = req.email;
        const cartDetails = await User.findOne({Email : email}).select("CartDetails");
        const cartItems = cartDetails.CartDetails;
        const itemIDs = cartItems.map((object)=>{
            return object.ItemID;
        })

        let itemQuantities = {};
        for(let i=0;i<cartItems.length;i++){
            itemQuantities[cartItems[i].ItemID] = cartItems[i].ItemQuantity;
        }

        const items = await Item.find({ItemID : {$in : itemIDs}}).select("ItemID ItemPrice");

        let totalPrice = 0;
        for(let i=0;i<items.length; i++){
            const originalPrice = items[i].ItemPrice;
            const discountPrice = Math.floor(originalPrice * (1 - utilities.getRandomDiscount(20, items[i].ItemID)));
            
            totalPrice += discountPrice * itemQuantities[items[i].ItemID];
        }

        res.status(200).json({totalPrice});

    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_cart_count = async (req, res)=>{
    try {
        const email = req.email;
        const cartCount = await User.findOne({Email : email}).select("CartCount");
        res.status(200).json({cartCount : cartCount.CartCount});
    }catch(error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const update_cart_count = async (req, res)=>{
    try{
        const email = req.email;
        const newCartCount = req.body.cartCount;
        await User.updateOne({Email : email}, {CartCount : newCartCount});
        res.status(200).json({message : "updated cart count"});
    }
    catch(error){
        console.loh(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_all_cart_items = async (req, res)=>{
    try{
        const email = req.email;
        const cart = await User.findOne({Email : email}).select("CartDetails");

        const itemIDs = cart.CartDetails.map((item)=>{
            return item.ItemID;
        })

        let itemQuantities = {};
        for(let i=0;i<cart.CartDetails.length;i++){
            itemQuantities[cart.CartDetails[i].ItemID] = cart.CartDetails[i].ItemQuantity;
        }

        const items = await Item.find({ItemID : {$in : itemIDs}}).select("ItemID ItemPrice ItemName");

        let itemPrices = {};
        let itemNames = {};

        for(let i=0;i<items.length;i++){
            const originalPrice = items[i].ItemPrice;
            const discountPrice = Math.floor(originalPrice * (1 - utilities.getRandomDiscount(20, items[i].ItemID)));

            itemPrices[items[i].ItemID] = discountPrice;
            itemNames[items[i].ItemID] = items[i].ItemName.PrimaryName;
        }

        res.status(200).json({itemIDs, itemQuantities, itemPrices, itemNames});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_cart_details = async (req, res)=>{
    try {
        if(!("page" in req.body)) throw Error("page not found in request body");
        else if(!("limit" in req.body)) throw Error("limit not found in request body");

        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
        const email = req.email;

        const cart = await User.aggregate([
            {$match : {Email : email}},
            {$unwind : "$CartDetails"},
            {$skip : (page - 1) * limit},
            {$limit : limit},
            {$group : {
                _id: '$_id',
                CartDetails: { $push: '$CartDetails' }
            }}
        ]);
        const cartDetails = cart[0] ? cart[0].CartDetails : [];

        const itemIDs = cartDetails.map((cartItem)=>{
            return cartItem.ItemID
        });
        
        let itemQuantities = {};
        for(let i=0;i<cartDetails.length;i++){
            itemQuantities[cartDetails[i].ItemID] = cartDetails[i].ItemQuantity;
        }

        const items = await Item.find({ItemID : {$in : itemIDs}});
        const cartItems = items.map((item)=>{
            const newItem = {
                ItemName : {
                    PrimaryName : item.ItemName.PrimaryName,
                    SecondaryName : item.ItemName.SecondaryName
                },
                ItemID : item.ItemID,
                ItemImage : item.ItemImage,
                ItemCount : item.ItemCount,
                ItemPrice : item.ItemPrice,
                ItemDiscountPrice : item.ItemDiscountPrice,
                ItemQuantity : itemQuantities[item.ItemID]
            }
            return newItem;
        });

        res.status(200).json({cartItems});
    }
    catch(error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const add_cart_details = async (req, res)=>{
    try{
        const email = req.email;
        const itemID = req.body.itemID;
        const itemQuantity = req.body.itemQuantity;
        
        const cartCount = await User.findOne({Email : email}).select("CartCount");
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID ItemCount");
        const existingCartItem = await User.findOne({Email : email, CartDetails : {$elemMatch : {ItemID : itemID}}}).select("CartDetails.$");

        if(!existingItem) throw Error("No Such Item Exists");
        if(existingItem.ItemCount === 0) throw Error("Item is out of stock");
        if(existingCartItem && existingCartItem.CartDetails.length > 0){
            throw Error("Item Already Added To Cart");
        }
        else{
            await User.updateOne({Email : email}, {$push : {CartDetails : {ItemID : itemID, ItemQuantity : itemQuantity}}, CartCount : cartCount.CartCount + 1});
            
            res.status(201).json({message : "Item Added To Cart"})
        }
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const delete_cart_details = async (req, res)=>{
    try{
        const email = req.email;
        const items = req.body.items;
        const prevCartCount = await User.findOne({Email : email}).select("CartCount");

        await User.updateOne({Email : email}, {$pull : {CartDetails : {ItemID : {$in : items}}}});
        await User.updateOne({Email : email}, {CartCount : prevCartCount.CartCount - items.length});
        res.json({message : "Items Removed From Cart"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const update_cart_quantity = async (req, res)=>{
    try{
        const email = req.email;
        const itemID = req.body.itemID;
        const newItemQuantity = req.body.itemQuantity;
        const existingItem = await Item.findOne({ItemID : itemID});
        const existingCartItem = await User.findOne({Email : email, CartDetails : {$elemMatch : {ItemID : itemID}}}).select("CartDetails.$");

        if(!(existingCartItem && existingCartItem.CartDetails.length > 0)) throw Error("Item does not exist in cart.");
        if(newItemQuantity > existingItem.ItemCount) throw Error("Maximum Limit Exceeded for item quantity");

        await User.updateOne({Email : email, "CartDetails.ItemID" : itemID},
                            {$set : {"CartDetails.$.ItemQuantity" : newItemQuantity}});
        res.status(200).json({message : "Updated Cart Quantity"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_notifications = async (req, res)=>{
    try {
        const email = req.email;
        const notifications = await User.aggregate([
            {$match : {Email : email}},
            {$unwind : "$Notifications"},
            {$match : {"Notifications.Viewed" : false}},
            {$group : {_id : "$_id", Notifications : {$push : "$Notifications"}}}
        ]);
        res.status(200).json({notifications : notifications.length > 0 ? notifications[0].Notifications : []});
    }
    catch(error) {
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_orders = async (req, res)=>{
    try{
        if(!("page" in req.body)) throw Error("page not found in request body");
        else if(!("limit" in req.body)) throw Error("limit not found in request body");

        const email = req.email;
        const page = req.body.page;
        const limit = req.body.limit;

        const ordersResponse = await User.aggregate([
            {$match : {Email : email}},
            {$unwind : "$Orders"},
            {$skip : (page - 1) * limit},
            {$limit : limit},
            {$group : {
                _id : "$_id",
                Orders : {$push : "$Orders"}
            }}
        ]);

        const orders = ordersResponse[0] ? ordersResponse[0].Orders : [];
        res.status(200).json({orders});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const add_orders = async (req, res)=>{
    try{
        const email = req.email;
        const orderItems = req.body.orderItems;
        const totalPrice = req.body.paymentAmount;
        const orderID = `RM-${utilities.randomID(8)}`
        const newOrder = {
            OrderID : orderID,
            OrderItems : orderItems,
            OrderDate : `${utilities.getDate()}`,
            Delivered : false
        }
        const newNotification = {
            Header : `Order with order_id : ${orderID} placed on ${utilities.getDate()}`,
            Body : `You placed an order of ${orderItems.length} items with a total cost of ${totalPrice}`,
            Viewed : false
        }
        await User.updateOne({Email : email}, {$push : {Orders : newOrder, Notifications : newNotification}});

        res.status(200).json({message : "Order Added"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const delete_orders = async (req, res)=>{
    try{
        const email = req.email;
        const orderID = req.body.orderID;
        await User.updateOne({Email : email}, {$pull : {Orders : {OrderID : orderID}}});
        res.status(200).json({message : "Order Deleted"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_shop_orders = async (req, res)=>{
    try{
        const email = req.email;
        const shopOrders = await User.findOne({Email : email}).select("ShopOrders");
        res.status(200).json({shopOrders : shopOrders.ShopOrders});
    }
    catch(error){
        console.log(error);
        res.status(501).json({errorMessage : error.message});
    }
}

const add_shop_orders = async (req, res)=>{
    try{
        const email = req.email;
        const shopID = req.body.shopID;
        const shopName = req.body.shopName;
        const shopOrderItems = req.body.shopOrderItems;
        const orderImage = req.body.orderImage;
        const newShopOrder = {
            OrderID : utilities.randomID(10),
            ShopID : shopID,
            ShopName : shopName,
            OrderItems : shopOrderItems,
            OrderImage : orderImage,
            Delivered : false
        }
        await User.updateOne({Email : email}, {$push : {ShopOrders : newShopOrder}});
        res.status(200).json({message : "Shop order added"});
    }
    catch(error){
        console.log(error);
        res.status(501).json({errorMessage : error.message});
    }
}

const delete_shop_orders = async (req, res)=>{
    try{
        const email = req.email;
        const orderID = req.body.orderID;
        await User.updateOne({Email : email}, {$pull : {ShopOrders : {OrderID : orderID}}});
        res.status(200).json({message : "Shop Order Removed"});
    }
    catch(error){
        console.log(error);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_favourite_items = async (req, res)=>{
    try{
        const email = req.email;
        const shopID = req.body.shopID;
        const favouriteItems = await User.aggregate([
            {$match : {Email : email}},
            {$unwind : "$FavouriteItems"},
            {$match : {"FavouriteItems.ShopID" : shopID}},
            {$group : {_id : "$_id", FavouriteItems : {$push : "$FavouriteItems"}}}
        ]);
        res.status(200).json({favouriteItems : favouriteItems.length > 0 ? favouriteItems[0].FavouriteItems : []});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const add_favourite_items = async (req, res)=>{
    try{
        const email = req.email;
        const itemID = req.body.itemID;
        const shopID = req.body.shopID;
        // const existingItem = await Item.findOne({ItemID : itemID, ItemShopID : shopID});

        // if(!existingItem) throw Error("Item does not exist");
        const newFavouriteItem = {
            ItemID : itemID,
            ShopID : shopID
        }

        await User.updateOne({Email : email}, {$push : {FavouriteItems : newFavouriteItem}});

        res.status(200).json({message : "Item Added To Favourite Items"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const delete_favourite_items = async (req, res)=>{
    try{
        const email = req.email;
        const itemID = req.body.itemID;
        await User.updateOne({Email : email}, {$pull : {FavouriteItems : {ItemID : itemID}}});
        res.status(200).json({message : "Favourite Item Removed"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_added_shops = async (req, res)=>{
    try{
        const email = req.email;
        const addedShops = await User.findOne({Email : email}).select("AddedShops");
        res.status(200).json({addedShops : addedShops.AddedShops});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const add_to_added_shops = async (req, res)=>{
    try{
        const email = req.email;
        const shopID = req.body.shopID;
        const newAddedShop = {
            ShopID : shopID
       }

       await User.updateOne({Email : email}, {$push : {AddedShops : newAddedShop}});
       res.status(200).json({message : "Shop added to AddedShops List"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const delete_added_shops = async (req, res)=>{
    try{
        const email = req.email;
        const shopID = req.body.shopID;
        await User.updateOne({Email : email}, {$pull : {AddedShops : {ShopID : shopID}}});
        res.status(200).json({message : "Shop Removed from addedShops"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const get_favourite_shops = async (req, res)=>{
    try{
        const email = req.email;
        const favouriteShops = await User.findOne({Email : email}).select("FavouriteShops");
        res.status(200).json({favouriteShops : favouriteShops.FavouriteShops});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const add_favourite_shops = async (req, res)=>{
    try{
        const email = req.email;
        const shopID = req.body.shopID;
        const newFavouriteShop = {
            ShopID : shopID
        }
        await User.updateOne({Email : email}, {$push : {FavouriteShops : newFavouriteShop}});
        res.status(200).json({message : "Shop added to favourite shops"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const delete_favourite_shops = async (req, res)=>{
    try{
        const email = req.email;
        const shopID = req.body.shopID;
        await User.updateOne({Email : email}, {$pull : {FavouriteShops : {ShopID : shopID}}});
        res.status(200).json({message : "favourite shop removed"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}







const push_notifications = async (req, res)=>{
    try{
        const email = req.email;
        const notificationHeader = req.body.header;
        const notificationBody = req.body.body;
        const newNotification = {
            Header : notificationHeader,
            Body : notificationBody,
            Viewed : false
        }
        await User.updateOne({Email : email}, {$push : {Notifications : newNotification}});
        res.status(200).json({message : "Notification Added"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}



module.exports = {
    sign_up_generate_otp,
    sign_up_resend_otp,
    sign_up_verify_otp,
    sign_in,
    forgot_password_otp,
    forgot_password_resend_otp,
    forgot_password_verify_otp,
    get_user_details,
    get_cart_total_price,
    get_cart_count,
    update_cart_count,
    update_cart_quantity,
    get_all_cart_items,
    get_cart_details,
    add_cart_details,
    delete_cart_details,
    get_notifications,
    get_orders,
    add_orders,
    delete_orders,
    get_shop_orders,
    add_shop_orders,
    delete_shop_orders,
    get_favourite_items,
    add_favourite_items,
    delete_favourite_items,
    get_added_shops,
    add_to_added_shops,
    delete_added_shops,
    get_favourite_shops,
    add_favourite_shops,
    delete_favourite_shops,
    push_notifications,
    get_buy_all_status,
    change_user_otp,
    change_user_verify
};