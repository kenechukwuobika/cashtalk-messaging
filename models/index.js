// const env = process.env.NODE_ENV
const dotenv = require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = require("../config/database/connection");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./User")(sequelize, Sequelize);
db.userProfile = require("./Userprofile")(sequelize, Sequelize);
db.message = require("./Message")(sequelize, Sequelize);
db.deletedMessage = require("./DeletedMessage")(sequelize, Sequelize);
db.chatRoom = require("./ChatRoom")(sequelize, Sequelize);
db.chatInstance = require("./ChatInstance")(sequelize, Sequelize);
db.participant = require("./Participant")(sequelize, Sequelize);
db.contact = require("./Contact")(sequelize, Sequelize);

db.user.hasOne(db.userProfile);
db.userProfile.belongsTo(db.user);

db.chatRoom.belongsToMany(
    db.user, 
    {
        through: db.chatInstance,
        foreignKey: 'chatRoomId'
    }
)

db.user.belongsToMany(
    db.chatRoom, 
    {
        through: db.chatInstance,
        foreignKey: 'userId'
    }
)

db.chatRoom.hasOne(db.chatInstance)
db.chatInstance.belongsTo(db.chatRoom)

db.user.hasMany(db.chatInstance)
db.chatInstance.belongsTo(db.user)

db.chatRoom.hasMany(db.participant)
db.participant.belongsTo(db.chatRoom)

db.user.hasOne(db.participant)
db.participant.belongsTo(db.user)

db.chatRoom.hasMany(db.message)
db.message.belongsTo(db.chatRoom)

db.message.hasMany(db.deletedMessage)
db.deletedMessage.belongsTo(db.message)

db.chatInstance.hasOne(db.contact)
db.contact.belongsTo(db.chatInstance)

// Refresh Databases
// db.message.sync({ alter: true });
module.exports = db;