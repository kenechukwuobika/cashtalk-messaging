const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class VideoMessage extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    VideoMessage.init({
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.literal("uuid_generate_v4()"),
            allowNull: false
        },
        messageId: {
            allowNull: false,
            type: DataTypes.UUID,
        },
        text: {
            allowNull: true,
            type: DataTypes.STRING
        },
    },
    {
        sequelize,
        modelName: "VideoMessage"
    });
    
    return VideoMessage;
};