const jwt = require("jsonwebtoken");
const { promisify } = require('util');
const User = require('../../models').user;

module.exports = async (req, data, next) => {
    const authHeader = req.headers.authorization;
    let token;
    if ( authHeader && authHeader.startsWith('Bearer') ){
      token = authHeader && authHeader.split(" ")[1];
    }
    if (!token){
        return next(new Error("You are Unauthorized"))
    }
      
    // 2) Verification token
    const decodedUser = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);
  
    if(!decodedUser){
        return next(new Error("You are Unauthorized"))
    }

    req.user = decodedUser;
    next();
  };