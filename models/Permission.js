const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Permission.init(
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
        canWithdraw: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        canDeposit: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        canTransfer: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
      sequelize,
      modelName: "permission"
    }
  );
  return Permission;
};
