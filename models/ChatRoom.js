const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ChatRoom extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    ChatRoom.init({
        id: {
            allowNull: false,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            primaryKey: true,
            type: DataTypes.UUID
        },
        isGroupChat: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
      sequelize,
      modelName: "chatRoom"
    });

    return ChatRoom;
};