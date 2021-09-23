module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      .then(() => {
        return queryInterface.createTable("Messagings", {
          id: {
            allowNull: false,
            defaultValue: Sequelize.literal("uuid_generate_v4()"),
            primaryKey: true,
            type: Sequelize.UUID
          },
          senderId: {
            allowNull: false,
            type: Sequelize.UUID
          },
          chat: {
            type: Sequelize.STRING
          },
          fileAccessKey: {
            allowNull: true,
            type: Sequelize.STRING
          },
          recipientId: {
            type: Sequelize.UUID
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Messagings");
  }
};
