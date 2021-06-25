const jwt = require("jsonwebtoken");
require("dotenv");

const authorizedToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token)
  if (token == null)
    return res.status(401).send({
      success: false,
      message: "You are Unauthorized"
    });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).send({
        success: false,
        message: "An occured while logging you in..."
      });

    next();
  });
};

module.exports = { authorizedToken };
