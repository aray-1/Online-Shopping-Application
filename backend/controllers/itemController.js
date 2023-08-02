const mongoose = require("mongoose");
const Item = require("../models/item");
const Category = require("../models/category");
const utilities = require("../utility-functions");
const User = require("../models/user");

function getTimeDifference(creationTime){
    const currentTime = new Date();
    const milliseconds = currentTime - creationTime;
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if(years > 0) return `${years} year${years > 1 ? "s" : ""}`;
    else if(months > 0) return `${months} month${months > 1 ? "s" : ""}`;
    else if(weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
    else if(days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    else if(hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    else if(minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    else return "1 minute";
}

async function saveItem(newItem){
    return new Promise((resolve, reject)=>{
        newItem.save()
        .then((result)=>{
            resolve();
        })
        .catch((err)=>{
            reject(err);
        })
    })
}

async function addFavouriteItems(email, items){
    return new Promise(async (resolve, reject)=>{
        try{
            if(!email){
                const modifiedItems = items.map((item)=>{
                    return {
                        ItemName : {
                            PrimaryName : item.ItemName.PrimaryName,
                            SecondaryName : item.ItemName.SecondaryName
                        },
                        ItemID : item.ItemID,
                        ItemImage : item.ItemImage,
                        ItemPrice : item.ItemPrice,
                        ItemCount : item.ItemCount,
                        ItemFavourite : false
                    }
                });
                resolve(modifiedItems);
            }
            else{
                const user = await User.findOne({Email : email}).select("FavouriteItems");
                const favouriteItems = user.FavouriteItems.map(object=>object.ItemID);
                const modifiedItems = items.map((item)=>{
                    return {
                        ItemName : {
                            PrimaryName : item.ItemName.PrimaryName,
                            SecondaryName : item.ItemName.SecondaryName
                        },
                        ItemID : item.ItemID,
                        ItemImage : item.ItemImage,
                        ItemPrice : item.ItemPrice,
                        ItemCount : item.ItemCount,
                        ItemFavourite : favouriteItems.includes(item.ItemID)
                    }
                });
                resolve(modifiedItems);
            }
        }
        catch(err){
            reject(err);
        }

    })
}

const add_item = async (req, res)=>{
    try{
        const existingCategory = await Category.findOne({CategoryID : req.body.itemCategoryID}).select("CategoryName");

        if(!existingCategory) throw Error("No such category exists as requested");
        if(req.body.itemCount < 0) throw Error("Item Count should be non-negative");
        if(req.body.itemPrice < 0) throw Error("Item Price should be non-negative");
        if(req.body.itemDiscountPrice < 0) throw Error("Item Discount Price should be non-negative");
        if(req.body.itemDiscountPrice > req.body.itemPrice) throw Error("Discount Price should not be greater than item MRP");

        const newItem = new Item({
            ItemName : {
                PrimaryName : req.body.itemPrimaryName,
                SecondaryName : req.body.itemSecondaryName
            },
            ItemCategory : {
                CategoryName : existingCategory.CategoryName,
                CategoryID : req.body.itemCategoryID
            },
            ItemID : utilities.randomID(30),
            ItemImage : req.body.itemImage,
            ItemCount : req.body.itemCount,
            ItemPrice : req.body.itemPrice,
            ItemDiscountPrice : req.body.itemDiscountPrice,
            ItemDescription : req.body.itemDescription,
            ItemTableDetails : req.body.itemTableDetails,
            ItemSaleCount : 0,
            ItemShopID : req.body.itemShopID
        });

        await saveItem(newItem);
        res.status(200).json({message : "New Item Added"});
    }
    catch(error){
        console.log(error.message);
        res.status(501).json({errorMessage : error.message});
    }
}

const change_name = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        const newItemName = req.body.itemName;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");
        if(!existingItem) throw Error("Item does not exist");
        await Item.updateOne({ItemID : itemID}, {"ItemName.PrimaryName" : newItemName.primaryName, "ItemName.SecondaryName" : newItemName.secondaryName});
        res.status(200).json({message : "Item name Changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_category = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        const newCategoryID = req.body.categoryID;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");
        const existingCategory = await Category.findOne({CategoryID : newCategoryID}).select("CategoryName CategoryID");

        if(!existingItem) throw Error("Item does not exist");
        if(!existingCategory) throw Error("Category does not exist");

        await Item.updateOne({ItemID : itemID}, {"ItemCategory.CategoryName" : existingCategory.CategoryName, "ItemCategory.CategoryID" : existingCategory.CategoryID});
        res.status(200).json({message : "Category changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_image = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        const newItemImage = req.body.itemImage;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");
        if(!existingItem) throw Error("Item does not exist");
        await Item.updateOne({ItemID : itemID}, {ItemImage : newItemImage});
        res.status(200).json({message : "Item image changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_count = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        const newItemCount = req.body.itemCount;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");

        if(newItemCount < 0) throw Error("Item count should be non-negative");
        if(!existingItem) throw Error("Item does not exist");
        await Item.updateOne({ItemID : itemID}, {ItemCount : newItemCount});
        res.status(200).json({message : "Item count changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_price = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        const newItemPrice = req.body.itemPrice;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");

        if(newItemPrice < 0) throw Error("Item price should be non-negative");
        if(!existingItem) throw Error("Item does not exist");
        await Item.updateOne({ItemID : itemID}, {ItemPrice : newItemPrice});
        res.status(200).json({message : "Item price changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_discount_price = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        const newItemDiscountPrice = req.body.itemDiscountPrice;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID ItemPrice");
        
        if(!existingItem) throw Error("Item does not exist");
        if(newItemDiscountPrice < 0) throw Error("Item Discount Price should be non-negative");
        if(newItemDiscountPrice > existingItem.ItemPrice) throw Error("Item Discount Price should be less than item MRP");

        await Item.updateOne({ItemID : itemID}, {ItemDiscountPrice : newItemDiscountPrice});
        res.status(200).json({message : "Item discount price changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_description = async (req, res)=>{
    try{
        if(!("itemID" in req.body)) throw Error("Item ID not available in request body");
        if(!("itemDescription" in req.body)) throw Error("Item Description not available in request body");
        
        const itemID = req.body.itemID;
        const newItemDescription = req.body.itemDescription;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");
        
        if(!existingItem) throw Error("Item does not exist");
        
        await Item.updateOne({ItemID : itemID}, {ItemDescription : newItemDescription});
        res.status(200).json({message : "Item description changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const change_tableDetails = async (req, res)=>{
    try{
        if(!("itemID" in req.body)) throw Error("Item ID not available in request body");
        if(!("itemTableDetails" in req.body)) throw Error("Item Table Details not available in request body");

        const itemID = req.body.itemID;
        const newItemTableDetails = req.body.itemTableDetails;
        const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID");
        if(!existingItem) throw Error("Item does not exist");
        await Item.updateOne({ItemID : itemID}, {ItemTableDetails : newItemTableDetails});
        res.status(200).json({message : "Item table details changed"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const increment_sales = async (req, res)=>{
    try{
        if(!("increments" in req.body)) throw Error("Increments not available in request body");

        const increments = req.body.increments;

        for(let i=0;i<increments.length;i++){
            const itemID = increments[i].itemID;
            const incrementValue = increments[i].incrementValue;
            const existingItem = await Item.findOne({ItemID : itemID}).select("ItemID ItemSaleCount");
            if(!existingItem) continue;
            await Item.updateOne({ItemID : itemID}, {ItemSaleCount : existingItem.ItemSaleCount + incrementValue});
        }
        res.status(200).json({message : "Item sales incremented"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const delete_item = async (req, res)=>{
    try{
        const itemID = req.body.itemID;
        await Item.deleteOne({ItemID : itemID});
        res.status(200).json({message : "Item Deleted"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_by_shopID = async (req, res)=>{
    try{
        if(!("shopID" in req.body)) throw Error("Shop ID not available in request body");
        const shopID = req.body.shopID;
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
        const items = await Item.find({ItemShopID : shopID}).skip((page - 1) * limit).limit(limit);
        res.status(200).json({items});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const autocomplete_suggestions = async (req, res)=>{
    try{
        if(!("searchText" in req.body)) throw Error("Search Text not available in request body");
        const limit = req.body.limit || 15;
        const searchText = req.body.searchText;
        const items = await Item.find({"ItemName.PrimaryName" : {$regex : `${searchText}`, $options : "i"}}).select("ItemName ItemID").limit(limit);
        res.status(200).json({items});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_search_results = async (req, res)=>{
    try{
        if(!("searchText" in req.body)) throw Error("Search Text not available in request body");
        
        const email = req.email;
        const searchText = req.body.searchText;
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
    
        const items = await Item.find({"ItemName.PrimaryName" : {$regex : `${searchText}`, $options : "i"}}).skip((page - 1) * limit).limit(limit).select("ItemName ItemID ItemImage ItemPrice ItemCount");
    
        const modifiedItems = await addFavouriteItems(email, items);

        res.status(200).json({items : modifiedItems});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_top_items = async (req, res)=>{
    try{
        if(!("topItemsCount" in req.body)) throw Error("Top Items Count not available in request body");

        const email = req.email;
        const topItemsCount = req.body.topItemsCount;
        const totalItems = await Item.countDocuments();
        const topItems = await Item.find().sort({ItemSaleCount : -1}).limit(topItemsCount < totalItems ? topItemsCount : totalItems).select("ItemName ItemID ItemImage ItemPrice ItemCount");

        const modifiedItems = await addFavouriteItems(email, topItems);
        res.status(200).json({topItems : modifiedItems});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_item_details = async (req, res)=>{
    try{
        if(!("itemList" in req.body)) throw Error("Item List not available in request body");
        const itemList = req.body.itemList;

        if(itemList.length === 0){
            res.status(200).json({items : []});
            return;
        }

        const items = await Item.find({ItemID : {$in : itemList.map(itemObject=>itemObject.itemID)}});
        res.status(200).json({items});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_by_categoryID = async (req, res)=>{
    try{
        if(!("categoryID" in req.body)) throw Error("Category ID not available in request body");
        const email = req.email;
        const categoryID = req.body.categoryID;
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
        const totalItems = await Item.countDocuments({"ItemCategory.CategoryID" : categoryID});
        const items = await Item.find({"ItemCategory.CategoryID" : categoryID}).skip((page - 1) * limit).limit(limit).select("ItemName ItemID ItemImage ItemPrice ItemCount");

        const modifiedItems = await addFavouriteItems(email, items);
        res.status(200).json({items : modifiedItems, totalItems : totalItems});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_popular_items = async (req, res)=>{
    try{
        if(!("popularItemsCount" in req.body)) throw Error("Popular Items Count not available in request body");
        if(!("categoryID" in req.body)) throw Error("Cateegory ID not available in request body");

        const email = req.email;
        const popularItemsCount = req.body.popularItemsCount;
        const categoryID = req.body.categoryID;
        const items = await Item.find({"ItemCategory.CategoryID" : categoryID}).sort({ItemSaleCount : -1}).limit(popularItemsCount).select("ItemName ItemID ItemImage ItemPrice ItemCount");

        const modifiedItems = await addFavouriteItems(email, items);
        res.status(200).json({items : modifiedItems});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const push_comment = async (req, res)=>{
    try{
        if(!("itemID" in req.body)) throw Error("itemID not found in request body");
        else if(!("userName" in req.body)) throw Error("userName not found in request body");
        else if(!("body" in req.body)) throw Error("body not found in request body");

        const email = req.email;
        const userName = req.body.userName;
        const body = req.body.body;
        const itemID = req.body.itemID;
        const existingItem = await Item.findOne({ItemID : itemID}).select("itemID");

        if(!existingItem) throw Error("Requested item does not exist");

        const newComment = {
            UserName : userName,
            Email : email,
            Body : body,
            CommentID : utilities.randomID(20)
        }

        await Item.updateOne({ItemID : itemID}, {$push : {ItemComments : newComment}});

        res.status(200).json({message : "Comment Added Successfully"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_comment = async (req, res)=>{
    try{
        if(!("itemID" in req.body)) throw Error("itemID not found in request body");
        
        const itemID = req.body.itemID;
        const comments = await Item.aggregate([
            {$match : {ItemID : itemID}},
            {$unwind : "$ItemComments"},
            {$sort : {"ItemComments.createdAt" : -1}},
            {$group : {
                _id : "$_id",
                ItemComments : {$push : "$ItemComments"}
            }}
        ])

        let commentsWithTime = [];

        if(comments.length === 0){
            res.status(200).json({comments : []});
            return;
        }

        for(let i=0;i<comments[0].ItemComments.length;i++){
            const comment = comments[0].ItemComments[i];
            const newCommentWithTime = {
                UserName : comment.UserName,
                Email : comment.Email,
                Body : comment.Body,
                Time : getTimeDifference(comment.createdAt)
            }
            commentsWithTime.push(newCommentWithTime);
        }

        res.status(200).json({comments : commentsWithTime});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

module.exports = {
    add_item,
    change_name,
    change_category,
    change_image,
    change_count,
    change_price,
    change_discount_price,
    change_description,
    change_tableDetails,
    increment_sales,
    delete_item,
    get_by_shopID,
    autocomplete_suggestions,
    get_search_results,
    get_top_items,
    get_item_details,
    get_by_categoryID,
    get_popular_items,
    push_comment,
    get_comment
}