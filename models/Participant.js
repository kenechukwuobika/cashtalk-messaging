const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Participant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Participant.init({
        id: {
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            primaryKey: true,
            type: DataTypes.UUID
        },
        chatRoomId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        userPhoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isOwner: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    },
    {
      sequelize,
      modelName: "participant"
    });

    return Participant;
};
