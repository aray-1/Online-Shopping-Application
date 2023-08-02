const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    BannerName : {
        type : String,
        required : true
    },
    BannerImage : {
        type : String,
        required : true
    },
    BannerID : {
        type : String,
        required : true
    }
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;