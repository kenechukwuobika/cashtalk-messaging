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
                return queryInterface.createTable("chatInstances", {
                    id: {
                        allowNull: false,
                        defaultValue: Sequelize.literal("uuid_generate_v4()"),
                        primaryKey: true,
                        type: Sequelize.UUID
                    },
                    chatRoomId: {
                        type: Sequelize.UUID,
                        allowNull: false
                    },
                    chatRoomType: {
                        type: Sequelize.DataTypes.ENUM('normal', 'group'),
                        defaultValue: 'normal',
                        allowNull: false
                    },
                    userId: {
                        type: Sequelize.UUID,
                        allowNull: false
                    },
                    unreadMessages: {
                        type: Sequelize.INTEGER,
                        defaultValue: 0
                    },
                    isArchived: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false
                    },
                    isMuted: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false
                    },
                    isDeleted: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false
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

        await queryInterface.dropTable("chatInstances");
    }
};
