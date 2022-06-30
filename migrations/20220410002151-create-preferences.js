'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize
        .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        .then(() => {
            return queryInterface.createTable("preferences", {
                id: {
                    primaryKey: true,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.literal("uuid_generate_v4()"),
                    allowNull: false
                },
                userId: {
                    type: Sequelize.UUID,
                    allowNull: false
                },
                readReceipts: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                lastSeen: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                dpVisibility: {
                    type: Sequelize.DataTypes.ENUM('nobody', 'contacts', 'everybody'),
                    allowNull: false,
                    defaultValue: 'everybody'
                },
                createdAt: Sequelize.DATE,
                updatedAt: Sequelize.DATE,
            });
        });
    },
    
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("preferences");
    }
};
