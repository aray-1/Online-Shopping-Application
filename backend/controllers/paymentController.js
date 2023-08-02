require("dotenv").config();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const utilities = require("../utility-functions");

const razorpayInstance = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
})

const get_razorpay_key = async (req, res)=>{
    try{
        res.status(200).json({key : process.env.RAZORPAY_KEY_ID});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_order_id = (req, res)=>{
    try{
        if(!("paymentAmount" in req.body)) throw Error("paymentAmount not found in request body");

        const paymentAmount = req.body.paymentAmount;

        razorpayInstance.orders.create({
            amount: paymentAmount * 100,
            currency: "INR",
            receipt: `rcp${utilities.randomID(10)}`
        })
        .then((result)=>{
            res.status(200).json({order_id : result.id});
        })
        .catch((err)=>{
            console.log(err.message);
            res.status(501).json({errorMessage : err.message});
        })
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errMessage : err.message});
    }
}

const payment_verification = async (req, res)=>{
    try{
        const razorpayOrderID = req.body.razorpayOrderID;
        const razorpayPaymentID = req.body.razorpayPaymentID;
        const signature = req.body.signature;

        const body = razorpayOrderID + "|" + razorpayPaymentID;

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

        const isAuthentic = expectedSignature === signature;

        res.status(200).json({isAuthentic});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errMessage : err.message});
    }
}

module.exports = {
    get_order_id,
    get_razorpay_key,
    payment_verification
}