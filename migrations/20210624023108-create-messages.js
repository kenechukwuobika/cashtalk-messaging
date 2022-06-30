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
                recipientId: {
                    type: Sequelize.UUID
                },
                gameId: {
                    type: Sequelize.UUID
                },
                paymentId: {
                    type: Sequelize.UUID
                },
                contactName: {
                    type: Sequelize.STRING
                },
                contactPhoneNumber: {
                    type: Sequelize.STRING
                },
                location_lat: {
                    type: Sequelize.STRING
                },
                location_long: {
                    type: Sequelize.STRING
                },
                type: {
                    type: Sequelize.ENUM,
                    values: ['text', 'photo', 'audio', 'video', 'sticker', 'contact', 'location', 'alert'],
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
                readReceipts: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                deletedForEveryone: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
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
        await queryInterface.sequelize.query('drop type enum_messages_type;');
        await queryInterface.sequelize.query('drop type enum_messages_status');
    }
};
