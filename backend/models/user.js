const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    Header : {
        type : String,
        required : true
    },
    Body : {
        type : String,
        required : true
    },
    Viewed : {
        type : Boolean,
        required : true
    }
});

const orderSchema = new Schema({
    OrderID : {
        type : String,
        required : true
    },
    OrderItems : [{
        ItemName : {
            type : String,
            required : true
        },
        ItemPrice : {
            type : Number,
            required : true
        },
        ItemQuantity : {
            type : Number,
            required : true
        }
    }],
    OrderDate : {
        type : String,
        required : true
    },
    Delivered : {
        type : Boolean,
        required : true
    }
}, {timestamps : true});

const shopOrderSchema = new Schema({
    OrderID : {
        type : String,
        required : true
    },
    ShopID : {
        type : String,
        required : true
    },
    ShopName : {
        type : String,
        required: true
    },
    OrderItems : [{
        ItemName : {
            type : String,
            required : true
        },
        ItemPrice : {
            type : Number,
            required : true
        },
        ItemQuantity : {
            type : Number,
            required : true
        }
    }],
    OrderImage : {
        type : String,
        required : true
    },
    Delivered : {
        type : Boolean,
        required : true
    }
}, {timestamps : true});

const cartSchema = new Schema({
    ItemID : {
        type : String,
        required : true
    },
    ItemQuantity : {
        type : Number,
        required : true
    }
});

const shopCartSchema = new Schema({
    ShopID : {
        type : String,
        required : true
    },
    ShopItems : [{
        ItemID : {
            type : String,
            required : true
        },
        ItemQuantity : {
            type : String,
            required : true
        }
    }]
});

const favouriteItemSchema = new Schema({
    ItemID : {
        type : String,
        required : true
    },
    ShopID : {
        type : String,
        required : true
    }
});

const addedShopSchema = new Schema({
    ShopID : {
        type : String,
        required : true
    }
});

const favouriteShopSchema = new Schema({
    ShopID : {
        type : String,
        required : true
    }
});

const userSchema = new Schema({
    UserName : {
        type : String,
        required : true
    },
    Email : {
        type : String,
        required: true
    },
    Password : {
        type : String,
        required : true
    },
    CartCount : {
        type : Number,
        required : true
    },
    CartDetails : [cartSchema],
    ShopCartDetails : [shopCartSchema],
    Notifications : [notificationSchema],
    Orders : [orderSchema],
    ShopOrders : [shopOrderSchema],
    FavouriteItems : [favouriteItemSchema],
    AddedShops : [addedShopSchema],
    FavouriteShops : [favouriteShopSchema]
},{timestamps : true});

const User = mongoose.model("User", userSchema);

module.exports = User;