const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    Email : {
        type : String,
        required : true
    },
    OTP : {
        type : String,
        required : true
    }
},{timestamps : true});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;