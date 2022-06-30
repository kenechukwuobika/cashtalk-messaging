'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize
        .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        .then(() => {
            return queryInterface.createTable("permissions", {
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
                canWithdraw: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                canDeposit: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                canTransfer: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                createdAt: Sequelize.DATE,
                updatedAt: Sequelize.DATE,
            });
        });
    },
    
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("permissions");
    }
};
