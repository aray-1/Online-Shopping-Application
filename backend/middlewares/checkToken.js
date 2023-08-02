require("dotenv").config();
const jwt = require("jsonwebtoken");

function checkToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if(!token){
        req.email = null;
        return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, email)=>{
        if(err) return res.sendStatus(403);
        req.email = email.Email;
        next();
    })
}

module.exports = checkToken;