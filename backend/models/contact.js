const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    ContactName : {
        type : String,
        required : true
    },
    ContactEmail : {
        type : String,
        required : true
    },
    ContactMessage : {
        type : String,
        required : true
    },
    ContactID : {
        type : String,
        required : true
    }
}, {timestamps : true});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;