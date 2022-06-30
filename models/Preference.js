const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Preference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Preference.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: new DataTypes.UUIDV4(),
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        readReceipts: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastSeen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        dpVisibility: {
            type: DataTypes.DataTypes.ENUM('everybody', 'nobody', 'contacts'),
            allowNull: false,
            defaultValue: 'everybody'
        }
    },
    {
      sequelize,
      modelName: "preference"
    }
  );
  return Preference;
};
