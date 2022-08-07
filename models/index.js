// const env = process.env.NODE_ENV
const Sequelize = require("sequelize");

const sequelize = require("../config/database/connection");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./User")(sequelize, Sequelize);
db.Message = require("./Message")(sequelize, Sequelize);
db.DeletedMessage = require("./DeletedMessage")(sequelize, Sequelize);
db.ReadByRecipients = require("./ReadByRecipients")(sequelize, Sequelize);
db.ChatRoom = require("./ChatRoom")(sequelize, Sequelize);
db.ChatInstance = require("./ChatInstance")(sequelize, Sequelize);
db.Participant = require("./Participant")(sequelize, Sequelize);
db.Contact = require("./Contact")(sequelize, Sequelize);

db.Profile = require("./Profile")(sequelize, Sequelize);
db.Permission = require("./Permission")(sequelize, Sequelize);
db.Preference = require("./Preference")(sequelize, Sequelize);

db.User.hasOne(db.Permission);
db.Permission.User = db.Permission.belongsTo(db.User);

db.User.hasOne(db.Preference);
db.Preference.User = db.Preference.belongsTo(db.User);

db.User.hasOne(db.Profile, {
    foreignKey: "userId"
});
db.Profile.belongsTo(db.User);

db.ChatRoom.belongsToMany(
    db.User, 
    {
        through: db.ChatInstance,
        foreignKey: 'chatRoomId'
    }
)

db.User.belongsToMany(db.ChatRoom, 
    {
        through: db.ChatInstance,
        foreignKey: 'userId'
    }
)

db.ChatRoom.hasOne(db.ChatInstance)
db.ChatInstance.belongsTo(db.ChatRoom)

db.User.hasMany(db.ChatInstance)
db.ChatInstance.belongsTo(db.User, {
    foreignKey: 'userId',
    as: 'user'
})

db.ChatInstance.belongsTo(db.User, {
    foreignKey: 'chatUserId',
    as: 'chatUser'
})

db.ChatRoom.hasOne(db.Participant, {
    foreignKey: 'chatRoomId',
    as: 'participants'
})
db.Participant.belongsTo(db.ChatRoom)

// db.User.hasOne(db.Participant)
// db.Participant.belongsTo(db.User)

db.ChatRoom.hasMany(db.Message)
db.ChatRoom.hasMany(db.Message, {
    foreignKey: 'chatRoomId',
    as: 'messagesCount'
})
db.Message.belongsTo(db.ChatRoom)

db.Message.hasMany(db.DeletedMessage)
db.DeletedMessage.belongsTo(db.Message)

db.Message.hasMany(db.ReadByRecipients)
db.ReadByRecipients.belongsTo(db.Message)

db.User.hasMany(db.Message, {
    foreignKey: 'senderId',
    as: 'sender'
})
db.Message.belongsTo(db.User,  {
    foreignKey: 'senderId',
    as: 'sender'
})

// Refresh Databases
// db.Message.sync({ alter: true });
module.exports = db;