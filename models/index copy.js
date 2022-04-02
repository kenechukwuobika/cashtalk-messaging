// const env = process.env.NODE_ENV
const dotenv = require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = require("../config/database/connection");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./User")(sequelize, Sequelize);
db.UserProfile = require("./Userprofile")(sequelize, Sequelize);
db.message = require("./Message")(sequelize, Sequelize);
db.chat = require("./Chat")(sequelize, Sequelize);
db.member = require("./Member")(sequelize, Sequelize);

// db.chat.hasMany(db.message, {
//     foreignKey: "chatId",
//     as: "messages"
// });

db.chat.belongsToMany(
    db.user, 
    {
        through: 'members',
        foreignKey: 'userId'
    }
)

db.chat.belongsToMany(
    db.user, 
    {
        through: db.chat,
        foreignKey: 'userId'
    }
)

db.user.belongsToMany(
    db.chat, 
    {
        through: 'members',
        foreignKey: 'chatId'
    }
)

db.user.hasMany(db.member)
db.member.belongsToMany(db.user, {})

// Refresh Databases
// db.message.sync({ alter: true });
module.exports = db;