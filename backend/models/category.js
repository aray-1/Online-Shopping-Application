const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    CategoryName : {
        type : String,
        required : true
    },
    CategoryID : {
        type : String,
        required : true
    },
    CategoryImage : {
        type : String,
        required : true
    },
    CategoryBannerImage : {
        type : String,
        required : true
    },
    CategorySales : {
        type : Number,
        required : true
    }
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;