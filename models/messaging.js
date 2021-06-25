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
        allowNull: false,
        type: DataTypes.STRING
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
