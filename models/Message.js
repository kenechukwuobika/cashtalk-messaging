const { Model } = require("sequelize");
const User = require("../models").user;

module.exports = (sequelize, DataTypes) => {
    class Message extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Message.init({
        id: {
            allowNull: false,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            primaryKey: true,
            type: DataTypes.UUID
        },
        senderId: {
            allowNull: false,
            type: DataTypes.UUID
        },
        chatRoomId: {
            allowNull: false,
            type: DataTypes.UUID
        },
        parentMesageId: {
            type: DataTypes.UUID
        },
        recipientId: {
            type: DataTypes.UUID
        },
        gameId: {
            type: DataTypes.UUID
        },
        paymentId: {
            type: DataTypes.UUID
        },
        contactName: {
            type: DataTypes.STRING
        },
        contactPhoneNumber: {
            type: DataTypes.STRING
        },
        location_lat: {
            type: DataTypes.STRING
        },
        location_long: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.ENUM,
            values: ['text', 'photo', 'audio', 'video', 'sticker', 'contact', 'location', 'alert'],
            defaultValue: 'text'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['unread', 'read'],
            defaultValue: 'unread'
        },
        text: {
            allowNull: true,
            type: DataTypes.STRING
        },
        fileAccessKey: {
            allowNull: true,
            type: DataTypes.STRING
        },
        readReceipts: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        deletedForEveryone: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: "message"
    });

    //hooks
    Message.addHook('afterFind', async (message, options) => {
        try {
            // const q = await message.findOne({ status: 'unread' });
            
            // console.log(message)
        } catch (error) {
            console.log(error)
        }
    })

    return Message;
};