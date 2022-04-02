const { Op } = require("sequelize");
const User = require('../models').user;
const ChatRoom = require('../models').chatRoom;
const ChatInstance = require('../models').chatInstance;
const Participant = require('../models').participant;
const Message = require('../models').message;
const DeletedMessage = require('../models').deletedMessage;
const Contact = require('../models').contact;
const errorController = require('../controllers/errorController');
const NotFoundError = require('../error/NotFoundError');
const sequelize = require('../config/database/connection');

exports.openChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = req.user;
            const { otherUserId } = req.body;

            const userIds = [currentUser.id, otherUserId];
            
            const chatInstance = await ChatInstance.find({
                user: currentUser.id,
                otherUserId
            });

            if(!chatInstance){
                userIds.forEach(userId => {
                    
                })
            }
        } catch (error) {
            console.log(error);
        }
    })
}

exports.getAllChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const user = req.user;
            const { page } = req.query;
            const limit = 10;
            const offset = (page - 1) * limit || 0;
            const chatRooms = await ChatRoom.findAll({
                include: [
                    { 
                        model: ChatInstance,
                        where: { 
                            userId: user.id,
                            isDeleted: false
                        }
                    },
                    { 
                        model: Participant
                    },
                    { 
                        model: Message,
                        where: {
                            id: {
                                [Op.notIn]: sequelize.literal(`
                                    (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = '${user.id}' ORDER BY "messages"."createdAt")
                                `)
                            }
                        },
                        order: [ 
                            ['createdAt', 'DESC'] 
                        ],
                    }
                ],
                limit,
                offset,
            });

            res.status(200).json({
                status: 'success',
                result: chatRooms.length,
                data: chatRooms
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: error.status,
                message: error.message
            })
        }
    });
}

exports.getChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { user } = req;
            const { chatRoomId } = req.params;

            const chatRoom = await ChatRoom.findOne({
                where: {
                    id: {
                        [Op.and]: [
                            {
                                [Op.eq]: chatRoomId
                            },
                            {
                                    [Op.in]: sequelize.literal(`
                                    (SELECT "chatRooms"."id" FROM "chatRooms" INNER JOIN "chatInstances" ON "chatRooms"."id" = "chatInstances"."chatRoomId" WHERE "chatInstances"."isDeleted" = false AND "chatInstances"."userId" = '${user.id}')
                                `)
                            }
                        ]
                    }
                },
                include: [
                    { 
                        model: ChatInstance,
                        where: { 
                            userId: user.id,
                            isDeleted: false
                        }
                    },
                    {
                        model: Participant
                    }
                ],
            });

            res.status(200).json({
                status: 'success',
                data: chatRoom
            })
            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            })
        }
    });

}

exports.muteChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { chatRoomId } = req.params;
            const { isMuted } = req.body;
            const chatData = { isMuted };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId: req.user.id
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];
            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
            });


        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });
}

exports.archiveChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { chatRoomId } = req.params;
            const { isArchived } = req.body;
            const chatData = { isArchived };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId: req.user.id
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];

            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
            })
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });
}

exports.deleteChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const userId = req.user.id;
            const { chatRoomId } = req.params;
            const messages = await Message.findAll({
                where: {
                    chatRoomId
                }
            });
            if(messages || messages.length !== 0){
                messages.forEach(async message => {
                    await DeletedMessage.create({
                        userId,
                        messageId: message.id
                    })
                })
            }
            const chatData = { isDeleted: true };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];

            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
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