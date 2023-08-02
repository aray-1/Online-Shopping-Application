const mongoose = require("mongoose");
const Contact = require("../models/contact");

function randomID(length){
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*";
    let id = "";
    for(let i=0;i<length;i++) id+=characters[Math.floor(Math.random()*characters.length)];
    return id;
}

const send_message = async (req, res)=>{
    try{
        if(!("contactEmail" in req.body)) throw Error("contactEmail not found in request body");
        else if(!("contactMessage" in req.body)) throw Error("contactMessage not found in request body");
        else if(!("contactName" in req.body)) throw Error("contactName not found in request body");

        const newContact = new Contact({
            ContactEmail : req.body.contactEmail,
            ContactName : req.body.contactName,
            ContactMessage : req.body.contactMessage,
            ContactID : randomID(20)
        });

        newContact.save()
        .then((result)=>{
            res.status(200).json({message : "Message delivered successfully"});
        })
        .catch((err)=>{
            throw Error(err.message);
        })

    }
    catch{(err)=>{
        console.log(err.message);
        res.status(501).json({errorMessage : err.message});
    }}
}

module.exports = {
    send_message
}