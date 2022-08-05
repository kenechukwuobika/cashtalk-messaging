const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
        }
    }
    
    User.init({
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        role: {
            type: DataTypes.DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false
        },
        transactionPin: DataTypes.STRING,
    },
    {
        defaultScope: {
            attributes: {
                exclude: ['transactionPin']
            }
        },
        sequelize,
        modelName: "user"
    });

    return User;
};