const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
    UserProfile.init({
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        userName: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Must be an email format"
                }
            }
        },
        imageKey: {
            type: DataTypes.STRING,
            defaultValue: 'default-user.jpg'
        },
        status: {
            type: DataTypes.STRING,
            values: ['online', 'offline']
        },
        lastSeen: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: Date.now()
        },
    },
    {
        sequelize,
        modelName: "userProfile"
    });
    
    return UserProfile;
};
