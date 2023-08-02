const mongoose = require("mongoose");
const Category = require("../models/category");

function randomID(length){
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*";
    let id = "";
    for(let i=0;i<length;i++) id+=characters[Math.floor(Math.random()*characters.length)];
    return id;
}

async function saveCategory(newCategory){
    return new Promise((resolve, reject)=>{
        newCategory.save()
        .then((result)=>{
            resolve();
        })
        .catch((err)=>{
            reject(err);
        })
    })
}

const add_category = async (req, res)=>{
    try{
        const newCategory = new Category({
            CategoryID : randomID(30),
            CategoryName : req.body.categoryName,
            CategoryImage : req.body.categoryImage,
            CategoryBannerImage : req.body.categoryBannerImage,
            CategorySales : 0
        })
        await saveCategory(newCategory);

        res.status(200).json({message : "Category Added"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const increment_sales = async (req, res)=>{
    try{
        const increments = req.body.increments;

        for(let i=0;i<increments.length;i++){
            const categoryID = increments[i].categoryID;
            const incrementValue = increments[i].incrementValue;
            const existingCategory = await Category.findOne({CategoryID : categoryID}).select("CategorySales");

            if(!existingCategory) continue;

            await Category.updateOne({CategoryID : categoryID}, {CategorySales : existingCategory.CategorySales + incrementValue});
        }
        res.status(200).json({message : "Category Sales Incremented"});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_all_categories = async (req, res)=>{
    try{
        const categories = await Category.find().select("CategoryName CategoryID");
        res.status(200).json({categories});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_top_categories = async (req, res)=>{
    try{
        const topCategoriesCount = req.body.topCategoriesCount;
        const totalCategories = await Category.countDocuments();
        const topCategories = await Category.find().sort({CategorySales : -1}).limit(topCategoriesCount < totalCategories ? topCategoriesCount : totalCategories).select("CategoryName CategoryID CategoryImage");

        res.status(200).json({topCategories});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

const get_banner = async (req, res)=>{
    try{
        const categoryID = req.body.categoryID;
        const category = await Category.findOne({CategoryID : categoryID}).select("CategoryBannerImage");
        res.status(200).json({categoryBannerImage : category.CategoryBannerImage});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

module.exports = {
    add_category,
    increment_sales,
    get_all_categories,
    get_top_categories,
    get_banner
}