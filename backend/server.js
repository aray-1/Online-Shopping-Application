require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Item = require("./models/item");
const user_routes = require("./routes/userRoutes");
const category_routes = require("./routes/categoryRoutes");
const item_routes = require("./routes/itemRoutes");
const banner_routes = require("./routes/bannerRoutes");
const contact_routes = require("./routes/contactRoutes");
const payment_routes = require("./routes/paymentRoutes");
const dbURI = process.env.MONGODB_URI;

const app = express();

// connecting to mongoDB Atlas server
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(async (result)=>{
    app.listen(4000, "0.0.0.0");
    console.log("Server Running On Port 4000");
})
.catch((err)=>{
    console.log(err);
})


app.use(cors());

app.get("/test", (req, res)=>{
    const message = "Pro sir make mitadru join discord";
    res.status(200).json({message});
})

app.use("/user", user_routes);
app.use("/category", category_routes);
app.use("/item", item_routes);
app.use("/banner", banner_routes);
app.use("/contact", contact_routes);
app.use("/payment", payment_routes);