const jwt = require("jsonwebtoken");
const { promisify } = require('util');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if ( authHeader && authHeader.startsWith('Bearer') ){
          token = authHeader && authHeader.split(" ")[1];
        }
        if (!token){
          return res.status(401).send({
            status: 'fail',
            message: "You are Unauthorized"
          });
        }
          
        // 2) Verification token
        const decodedUser = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedUser)
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = decodedUser;
        next();
    } catch (error) {
        return res.status(401).send({
            status: 'fail',
            message: error.message
          })
    }
};