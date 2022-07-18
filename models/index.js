// const env = process.env.NODE_ENV
const dotenv = require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = require("../config/database/connection");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./User")(sequelize, Sequelize);
db.message = require("./Message")(sequelize, Sequelize);
db.deletedMessage = require("./DeletedMessage")(sequelize, Sequelize);
db.messageReadBy = require("./MessageReadBy")(sequelize, Sequelize);
db.chatRoom = require("./ChatRoom")(sequelize, Sequelize);
db.chatInstance = require("./ChatInstance")(sequelize, Sequelize);
db.participant = require("./Participant")(sequelize, Sequelize);
db.contact = require("./Contact")(sequelize, Sequelize);

db.profile = require("./Profile")(sequelize, Sequelize);
db.permission = require("./Permission")(sequelize, Sequelize);
db.preference = require("./Preference")(sequelize, Sequelize);

db.user.hasOne(db.permission);
db.permission.User = db.permission.belongsTo(db.user);

db.user.hasOne(db.preference);
db.preference.User = db.preference.belongsTo(db.user);

db.user.hasOne(db.profile);
db.profile.belongsTo(db.user);

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
db.chatInstance.belongsTo(db.user, {
    foreignKey: 'userId',
    as: 'user'
})

db.chatInstance.belongsTo(db.user, {
    foreignKey: 'chatUserId',
    as: 'chatUser'
})

db.chatRoom.hasMany(db.participant)
db.participant.belongsTo(db.chatRoom)

db.user.hasOne(db.participant)
db.participant.belongsTo(db.user)

db.chatRoom.hasMany(db.message)
db.message.belongsTo(db.chatRoom)

db.message.hasMany(db.deletedMessage)
db.deletedMessage.belongsTo(db.message)

db.message.hasMany(db.messageReadBy)
db.messageReadBy.belongsTo(db.message)

// Refresh Databases
// db.message.sync({ alter: true });
module.exports = db;