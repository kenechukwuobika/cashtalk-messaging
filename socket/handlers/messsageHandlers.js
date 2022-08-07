const { Op } = require("sequelize");
const sequelize = require('../../config/database/connection');
const {
    Message,
    ReadByRecipients,
    User,
    ChatRoom,
    ChatInstance,
    Participant,
    Preference
} = require('../../models');

const errorHandler = require("./errorHandler");
const {
    MESSAGE_READ,
    MESSAGE_SEND,
    TYPING_START,
    TYPING_STOP,
    MESSAGE_DELETE_EVERYONE,
    MESSAGE_DELIVERED
} = require('../../constants/socketEvents');

exports.sendMessage = socket => async (data, callback) => {
    await sequelize.transaction(async t => {
        try {
            console.log(data)
            let chatRoom = null;
            let recipients = null;
            let parsedMessage = false;
            const currentUser = await User.findByPk(socket.request.user.id, {
                include: [Preference]
            });

            const isBlocked = false;
            // const isBlocked = true;
            if(isBlocked){
                return callback(errorHandler(403, "Please provide a valid chat room id or user id"));
            }
            
            const { chatRoomId, chatUserId, parentMesageId, type } = data;
            
            if(!chatRoomId && !chatUserId){
                return callback(errorHandler(400, "Please provide a valid chat room id or user id"));
            }

            if(chatRoomId){
                chatRoom = await ChatRoom.findByPk(chatRoomId);
                if(!chatRoom){
                    return callback(errorHandler(400, "chatRoom not found"));
                }
            }
            else{
                chatRoom = await getChatByUsers(currentUser.id, chatUserId);
                if(!chatRoom){
                    chatRoom = await createChatByUsers([chatUserId, currentUser.id]);
                }
            }

            const message = { 
                chatRoomId: chatRoom.id,
                type,
                parentMesageId,
                senderId: currentUser.id,
                recipients,
                readReceipts: currentUser.preference.readReceipts
            };

            switch(message.type){
                case 'text':
                    parsedMessage = parseText(message, data);
                    break;
                case 'photo':
                    parsedMessage = parsePhoto(message, data);
                    break;
                case 'video':
                    parsedMessage = parseVideo(message, data);
                    break;
                case 'audio':
                    parsedMessage = parseAudio(message, data);
                    break;
                case 'voiceNote':
                    parsedMessage = parseVoiceNote(message, data);
                    break;
                case 'document':
                    parsedMessage = parseDocument(message, data);
                    break;
                case 'location':
                    parsedMessage = parseLocation(message, data);
                    break;
                case 'contact':
                    parsedMessage = parseContact(message, data);
                    break;
                default:
                    callback(errorHandler(400, "invalid message"));
                    break;
            }

            if(!parsedMessage){
                return callback(errorHandler(400, "invalid message"));
            }

            const newMessage = await Message.create(message);

            if(chatRoom.isGroupChat){
                newMessage.recipients = chatRoom.participants;
            }
            else{
                newMessage.recipients = [chatUserId];
            }

            console.log(newMessage.recipients)
            newMessage.recipients.forEach(recipient => {
                socket.in(recipient).emit(MESSAGE_SEND, newMessage);
            });

            await newMessage.save();
            io.of('/api/v1').in(currentUser.id).emit(MESSAGE_SEND, newMessage)

            callback({
                status: 200,
                status: "success",
                message: "Message sent successfully"
            });

        } catch (error) {
            console.log(error);
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

exports.readMessage = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId } = data;

            const messages = await Message.findAll({
                where: {
                    chatRoomId,
                    senderId: {
                        [Op.ne]: currentUser.id
                    },
                    id: {
                        [Op.notIn]: sequelize.literal(`
                            (SELECT "message"."id" FROM "messages" AS "message" INNER JOIN "readByRecipients" ON "message"."id" = "readByRecipients"."messageId" AND "readByRecipients"."userId" = '${currentUser.id}')
                        `)
                    },
                }
            });
            
            const readByRecipients = [];

            if(messages && messages.length !== 0){
                messages.forEach(async message => {
                    readByRecipients.push({
                        userId: currentUser.id,
                        messageId: message.id
                    })
                })
            }

            const res = await ReadByRecipients.bulkCreate(readByRecipients)

            socket.emit(MESSAGE_READ, res);
        } catch (error) {
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

exports.deliverMessage = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { messageId } = data;

            const [ isMessageUpdated, message] = await Message.update({
                status: "delivered"
            }, 
            {
                where: {
                    id: messageId
                },
                returning: true
            });

            socket.emit(MESSAGE_DELIVERED, message);

            callback({
                status: 200,
                status: "success",
                message: "Message delivered successfully"
            });

        } catch (error) {
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

exports.deleteMessageEveryone = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { messageIds } = data;

            const [messages, messagesUpdated] = await Message.update({
                deletedForEveryone: true
            },
            {
                where: {
                    id: [messageIds],
                    senderId: currentUser.id
                }
            });

            socket.emit(MESSAGE_DELETE_EVERYONE, messages);
        } catch (error) {
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

exports.startTyping = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            // const currentUser = socket.request.user;
            const currentUser = await User.findByPk(socket.request.user.id);

            const { chatRoomId } = data;

            const chatRoom = await ChatRoom.findByPk(chatRoomId, {
                include: [Participant]
            });
            
            if(!chatRoom){
                return callback(errorHandler(400, "Please provide a valid chat room id"));
            }

            const typingData = {
                user: currentUser,
                chatRoomId,
                message: '...typing'
            }

            chatRoom.participants.forEach(participant => {
                if(participant.id !== currentUser.id){
                    io.of('/api/v1').in(participant.userId).emit(TYPING_START, typingData)
                }
            })

        } catch (error) {
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

exports.stopTyping = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            // const currentUser = socket.request.user;
            const currentUser = await User.findByPk(socket.request.user.id);

            const { chatRoomId } = data;

            const chatRoom = await ChatRoom.findByPk(chatRoomId, {
                include: [Participant]
            });

            
            if(!chatRoom){
                return callback(errorHandler(400, "Please provide a valid chat room id"));
            }

            const typingData = {
                user: currentUser,
                chatRoomId,
                message: ''
            }

            chatRoom.participants.forEach(participant => {
                if(participant.id !== currentUser.id){
                    io.of('/api/v1').in(participant.userId).emit(TYPING_STOP, typingData)
                }
            })

        } catch (error) {
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

const getChatByUsers = async (userId, chatUserId) => {
    try {
        return await ChatRoom.findOne({
            include: [
                {
                    model: ChatInstance,
                    where: {
                        userId,
                        chatUserId
                    }
                }
            ]
        }) 
    } catch (error) {
        return callback(errorHandler(404, "ChatRoom not found"));
    }
}

const createChatByUsers = async (users) => {
    const chatInstances = [];
    users.forEach(user => {
        const chatUserId = users.find(elm => elm !== user);
        
        const chatInstance = {
            userId: user,
            chatUserId,
            unreadMessages: 0
        };

        chatInstances.push(chatInstance);
    });
    
    const chatRoom = await ChatRoom.create({
        chatInstance: [chatInstances]
    }, {
        include: [
            ChatInstance
        ]
    });

    if(!chatRoom){
        return callback(errorHandler(404, "Chatroom not found"));
    }

    return chatRoom
}

const parseText = (message, data) => {
    const { text } = data;
    if(!text){
        callback(errorHandler(400, "Please provide text"));
        return false;
    }

    Object.assign(message, { text });
    return true;
}

const parsePhoto = (message, data) => {
    const { fileAccessKey, text } = data;
    if(!fileAccessKey){
        callback(errorHandler(400, "Please provide file key"));
        return false;
    }

    Object.assign(message, { fileAccessKey, text });
    return true;
}

const parseAttachment = (message, data) => {
    const { fileUrl, text } = data;
    if(!fileUrl){
        return callback(errorHandler(400, "Please provide file url"));
        return false;
    }

    Object.assign(message, { fileUrl, text });
    return true;
}


const parseLocation = (message, data) => {
    const { lat, long, text } = data;
    if(!lat){
        callback(errorHandler(400, "Please provide latitude"));
        return false;
    }

    if(!long){
        callback(errorHandler(400, "Please provide longitude"));
        return false;
    }

    Object.assign(message, { 
        location_lat: lat,
        location_long: long, 
        text
    });
    return true
}

const parseContact = (message, data) => {
    const { contactName, contactPhoneNumber } = data;
    if(!contactName){
        callback(errorHandler(400, "Please provide contact name"));
        return false;
    }

    if(!contactPhoneNumber){
        callback(errorHandler(400, "Please provide contact phone number"));
        return false;
    }

    Object.assign(message, { contactName, contactPhoneNumber });
    return true;
}