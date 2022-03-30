'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /*
        Add altering commands here.
        Return a promise to correctly handle asynchronicity.

        Example:
        return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
        return queryInterface.sequelize
            .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
            .then(() => {
                return queryInterface.createTable("chat-group", {
                    id: {
                        allowNull: false,
                        defaultValue: Sequelize.literal("uuid_generate_v4()"),
                        primaryKey: true,
                        type: Sequelize.UUID
                    },
                    chatID: {
                        allowNull: false,
                        type: Sequelize.UUID
                    },
                    name: {
                        allowNull: false,
                        type: Sequelize.STRING
                    },
                    avatar: {
                        type: Sequelize.STRING,
                        defaultValue: 'defaultChatGroup.jpg'
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
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

    await queryInterface.dropTable("chat-group");
  }
};
