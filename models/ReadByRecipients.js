const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ReadByRecipients extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    ReadByRecipients.init({
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            allowNull: false
        },
        userId: {
            allowNull: false,
            type: DataTypes.UUID,
        },
        messageId: {
            allowNull: false,
            type: DataTypes.UUID,
        }
    },
    {
        sequelize,
        modelName: "readByRecipients",
        freezeTableName: true,
        timestamps: true
    });
    
    return ReadByRecipients;
};