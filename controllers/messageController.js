const { Op } = require("sequelize");
const { AppError } = require("cashtalk-common");

const sequelize = require('../config/database/connection');
const {
    Message,
    ReadByRecipients,
    DeletedMessage,
    User,
    Profile
} = require('../models');

exports.getAllMessages = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { chatRoomId } = req.query;
            const messages = await Message.findAll({
                where: {
                    id: {
                        [Op.notIn]: sequelize.literal(`
                            (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = "users"."id")
                        `)
                    },
                    chatRoomId
                },
                order: [
                    ['createdAt', 'ASC']
                ],
                include: [
                    {
                        model: User, as: 'sender',
                        include: {
                            model: Profile
                        }
                    },
                    {
                        model: ReadByRecipients
                    }
                ]
            });

            res.status(200).json({
                status: 'success',
                result: messages.length,
                messages
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

exports.getMessage = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { messageId } = req.params;
            const message = await Message.findOne({
                where: {
                    id: {
                        [Op.eq]: messageId,
                        [Op.notIn]: sequelize.literal(`
                            (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = "users"."id")
                        `)
                    }
                },
                include: [
                    {
                        model: User, as: 'sender'
                    },
                    {
                        model: ReadByRecipients,
                    }
                ]
            });

            if(!message){
                return next(new AppError(404, "Message not found"));
            }

            res.status(200).json({
                status: 'success',
                message
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
            const { messageId } = req.params;
            const message = await Message.findByPk(messageId);

            if(!message){
                return next(new AppError(404, "Message not found"));
            }

            const deletedMessage = await DeletedMessage.create({
                userId: req.user.id,
                messageId
            });

            res.status(200).json({
                status: 'success',
                message: deletedMessage
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