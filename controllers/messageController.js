const { Op } = require("sequelize");
const sequelize = require('../config/database/connection');
const Message = require('../models').message;
const DeletedMessage = require('../models').deletedMessage;

exports.getAllMessages = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const messages = await Message.findAll({
                where: {
                    id: {
                        [Op.notIn]: sequelize.literal(`
                            (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = "users"."id")
                        `)
                    }
                }
            });

            res.status(200).json({
                status: 'success',
                data: messages
            });

        } catch (error) {           
            console.log(error);

            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });
}

exports.deleteMessage = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const deletedMessage = await DeletedMessage.create({
                userId: req.user.id,
                messageId: req.params.messageId
            });

            res.status(200).json({
                status: 'success',
                data: deletedMessage
            });

        } catch (error) {           
            console.log(error);

            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });

}