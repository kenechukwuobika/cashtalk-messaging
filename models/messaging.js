const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Messaging extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Messaging.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: new DataTypes.UUIDV4(),
        primaryKey: true
      },
      senderId: {
        type: DataTypes.UUID
      },
      chat: {
        allowNull: true,
        type: DataTypes.STRING
      },
      fileAccessKey: {
        allowNull: true,
        type: DataTypes.STRING,
        validate: {
          customValidator(value) {
            if (value === null && this.chat === null) {
              throw new Error("You cannot send an empty message");
            }
          }
        }
      },
      recipientId: DataTypes.UUID
    },
    {
      sequelize,
      modelName: "Messaging"
    }
  );
  return Messaging;
};
