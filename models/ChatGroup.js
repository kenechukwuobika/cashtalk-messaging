const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Chat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Chat.init({
        id: {
            allowNull: false,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            primaryKey: true,
            type: DataTypes.UUID
        },
        name: {
            type: DataTypes.STRING
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: 'defaultChatGroup.jpg'
        },
        description: {
            type: DataTypes.STRING
        },
        participantNumber: {
        type: DataTypes.INTEGER
        },
    },
    {
      sequelize,
      modelName: "Chat"
    });

    return Chat;
};
