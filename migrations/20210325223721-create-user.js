"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      .then(() => {
        return queryInterface.createTable("users", {
            id: {
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("uuid_generate_v4()"),
                allowNull: false
            },
            phoneNumber: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            role: {
                type: Sequelize.DataTypes.ENUM('user', 'admin'),
                defaultValue: 'user',
                allowNull: false
            },
            transactionPin: Sequelize.STRING,
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  }
};
