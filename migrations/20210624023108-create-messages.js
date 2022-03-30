module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize
            .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
            .then(() => {
            return queryInterface.createTable("messages", {
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
                chatRoomId: {
                    allowNull: false,
                    type: Sequelize.UUID
                },
                parentMesageId: {
                    type: Sequelize.UUID
                },
                type: {
                    type: Sequelize.ENUM,
                    values: ['text', 'photo', 'audio', 'video'],
                    defaultValue: 'text'
                },
                status: {
                    type: Sequelize.ENUM,
                    values: ['unread', 'read'],
                    defaultValue: 'unread'
                },
                text: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                fileAccessKey: {
                    allowNull: true,
                    type: Sequelize.STRING
                },
                deletedBy: {
                    type: Sequelize.ARRAY(Sequelize.STRING)
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Date.now()
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Date.now()
                }
            });
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("messages");
    }
};
