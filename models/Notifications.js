const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class userRelationship extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    userRelationship.init({
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
        contactId: {
            allowNull: false,
            type: DataTypes.UUID,
        },
        isMuted: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: "userRelationship"
    });
    
    return userRelationship;
};