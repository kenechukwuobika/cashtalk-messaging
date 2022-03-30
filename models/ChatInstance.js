const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ChatInstance extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    ChatInstance.init({
        id: {
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            primaryKey: true,
            type: DataTypes.UUID
        },
        chatRoomId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        chatRoomType: {
            type: DataTypes.DataTypes.ENUM('normal', 'group'),
            defaultValue: 'normal',
            allowNull: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        unreadMessages: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isMuted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
      sequelize,
      modelName: "chatInstance"
    });

    return ChatInstance;
};
