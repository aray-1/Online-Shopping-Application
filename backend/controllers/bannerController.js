const mongoose = require("mongoose");
const Banner = require("../models/banner");

const get_banners = async (req, res)=>{
    try{
        const banners = await Banner.find();
        res.status(200).json({banners});
    }
    catch(err){
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }
}

module.exports = {
    get_banners
}