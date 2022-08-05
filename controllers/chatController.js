const { Op } = require("sequelize");
const User = require('../models').user;
const ChatRoom = require('../models').chatRoom;
const ChatInstance = require('../models').chatInstance;
const Participant = require('../models').participant;
const Message = require('../models').message;
const DeletedMessage = require('../models').deletedMessage;
const MessageReadBy = require('../models').messageReadBy;

const { catchAsync, AppError } = require("cashtalk-common");
const sequelize = require('../config/database/connection');


/**
* Get a replica of the chat object
* 
* @function
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @param {Function} next - Express next middleware function
* 
*/
exports.getChatObj = (req, res, next) => {
    const chat = {
        isGroupChat: false,
        name: null,
        avatar: null,
        createdAt: "2022-05-30T09:07:05.271Z",
        updatedAt: "2022-05-30T09:07:05.271Z",
        unreadMessages: "1",
        chatInstance: {
            id: "4e145887-0846-4ad1-ab54-66c6af7994c9",
            chatRoomId: "7df6eeaa-7b12-42e1-ba31-d5d44b7845f2",
            userId: "9bb5af68-354c-49c1-bdec-c35fb4c52c01",
            chatUserId: "9bb5af68-354c-49c1-bdec-c35fb4c52c02",
            isArchived: false,
            isDeleted: false,
            createdAt: "2022-05-30T09:07:05.364Z",
            updatedAt: "2022-05-30T09:07:05.364Z",
            chatUser: {
                id: "9bb5af68-354c-49c1-bdec-c35fb4c52c02",
                phoneNumber: "07018867821",
                createdAt: "2022-04-27T18:58:31.812Z",
                updatedAt: "2022-04-27T18:58:31.812Z"
            }
        },
        participants: [],
        messages: []
    };

    res.status(200).json({
        status: 'success',
        chat
    })
}

exports.getAllChat = catchAsync(
    /**
    * Get all chats for the current authenticated user
    * 
    * @function
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    * @param {Function} next - Express next middleware function
    * 
     */
    async (req, res, next) => {
        await sequelize.transaction(async t => {
            const { user } = req;
            // calculate limit and offset for pagination
            const limit = 1;
            const offset = (req.query.page - 1) * limit || 0;

            const chats = await ChatRoom.findAll({
                attributes:{
                    include: [[sequelize.literal(`(SELECT COUNT(*) FROM "messages" WHERE "messages"."id" NOT IN (SELECT "messages"."id" FROM "messages" INNER JOIN "messageReadBy" ON "messages"."id" = "messageReadBy"."messageId" WHERE "messages"."id" = "messageReadBy"."messageId" ORDER BY "messages"."createdAt") AND "messages"."senderId" != '${user.id}' GROUP BY "messages"."chatRoomId")`), 'unreadMessages']]
                },
                include: [
                    {
                        model: ChatInstance,
                        where: { 
                            userId: req.user.id
                        },
                        include: {
                            model: User, as: 'chatUser'
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
                        limit,
                        offset,
                        include: [
                            {
                                model: User, as: 'sender'
                            },
                            {
                                model: MessageReadBy
                            }
                        ]
                    },
                ]
            });

            // check if chats exists
            if(!chats){
                return next(new AppError(400, "Could not get chats, please try again later"));
            }

            res.status(200).json({
                status: 'success',
                result: chats.length,
                chats
            })
        });
    }
)

exports.getChatById = catchAsync(
    /**
    * Get one chat by id for the current authenticated user
    * 
    * @function
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    * @param {Function} next - Express next middleware function
    * 
     */
    async (req, res, next) => {
        await sequelize.transaction(async t => {
            const { user } = req;
            const chat = await ChatRoom.findOne({
                where: {
                    id: {
                        [Op.and]: [
                            {
                                [Op.eq]: req.params.chatRoomId
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
                            userId: req.user.id,
                            isDeleted: false
                        }
                    },
                    {
                        model: Participant
                    },
                    {
                        model: Message
                    }
                ],
            });

            if(!chat){
                return next(new AppError(404, "Chat not found"));
            }

            res.status(200).json({
                status: 'success',
                chat
            })
        });
    }
)

exports.getChatByUsers = catchAsync(
    /**
    * Get one chat with between the current authenticate user and another user
    * 
    * @function
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    * @param {Function} next - Express next middleware function
    * 
     */
    async (req, res, next) => {
        await sequelize.transaction(async t => {
            const { user } = req;
            const { chatUserId } = req.query;
            
            const chat = await ChatRoom.findOne({
                include: [
                    {
                        model: ChatInstance,
                        where: {
                            userId: user.id,
                            chatUserId
                        }
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
                        limit: 1
                    }
                ]
            })

            res.status(200).json({
                status: 'success',
                data: chat
            })
                
        });
    }
)

exports.archiveChat = catchAsync(
    /**
    * Archive current chat for just the current authenticated user
    * 
    * @function
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    * @param {Function} next - Express next middleware function
    * 
     */
    async (req, res, next) => {
        await sequelize.transaction(async t => {
            const { chatRoomId } = req.params;
            const { isArchived } = req.body;
            const chatData = { isArchived };
            const [isChatInstanceUpdated, updatedChatInstance] = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId: req.user.id
                },
                returning: true
            });

            if(!isChatInstanceUpdated){
                return next(new AppError(404, "Chat not found"));
            }

            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
            })
        
        });
    }
)

exports.deleteChat = catchAsync(
    /**
    * Delete chat for just the current authenticated user
    * 
    * @function
    * @param {Object} req - Express request object
    * @param {Object} res - Express response object
    * @param {Function} next - Express next middleware function
    * 
     */
    async (req, res, next) => {
        await sequelize.transaction(async t => {
            const userId = req.user.id;
            const { chatRoomId } = req.params;
            
            // check if message exists first
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

            // add message to deleted messages
            const chatData = { isDeleted: true };
            const [isChatInstanceUpdated, updatedChatInstance] = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId
                },
                returning: true
            });

            if(!isChatInstanceUpdated){
                return next(new AppError(404, "Chat not found"));
            }

            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
            });
        });
    }
)