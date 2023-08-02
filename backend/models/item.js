const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    UserName : {
        type : String
    },
    Email : {
        type : String
    },
    Body : {
        type : String
    },
    CommentID : {
        type : String
    }
},{timestamps : true});

const tableDetailSchema = new Schema({
    Property : {
        type : String
    },
    Value : {
        type : String
    }
});

const itemSchema = new Schema({
    ItemName : {
        PrimaryName : {
            type : String,
            required : true
        },
        SecondaryName : {
            type : String
        }
    },
    ItemCategory : {
        CategoryName : {
            type : String,
            required : true
        },
        CategoryID : {
            type : String,
            required : true
        }
    },
    ItemID : {
        type : String,
        required : true
    },
    ItemImage : {
        type : String,
        required : true
    },
    ItemCount : {
        type : Number,
        required : true
    },
    ItemPrice : {
        type : Number,
        required : true
    },
    ItemDiscountPrice : {
        type : Number,
        required : true
    },
    ItemDescription : {
        type : String,
        required : true
    },
    ItemTableDetails : [tableDetailSchema],
    ItemSaleCount : {
        type : Number,
        required : true
    },
    ItemShopID : {
        type : String
    },
    ItemComments : [commentSchema]
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;