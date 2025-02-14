const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class contact extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    contact.init({
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            allowNull: false
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        contactId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contactName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contactPhoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "contact"
    });
    
    return contact;
};