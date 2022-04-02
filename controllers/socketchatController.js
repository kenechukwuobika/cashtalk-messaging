const { Op } = require("sequelize");
const User = require('../models').user;
const ChatRoom = require('../models').chatRoom;
const Contact = require('../models').contact;
const Message = require('../models').message;
const DeletedMessage = require('../models').deletedMessage;
const ChatInstance = require('../models').chatInstance;
const Participant = require('../models').participant;
const errorController = require('./errorController');
const sequelize = require('../config/database/connection');
const queue = require('../common/events/queue');
const {
    CHAT_OPEN,
    CHAT_INITIATE,
    CHAT_GETALL,
    GROUPCHAT_CREATE,
    GROUPCHAT_ADDADMIN,
    CHAT_GETONE,
    CHAT_UPDATE,
    CHAT_DELETE,
    MESSAGE_SEND,
} = require('../constants/socketEvents');

// exports.initiateChat = socket => async (data) => {
//     await sequelize.transaction(async t => {
//         try {
//             const { message, recipientId } = data;
//             let chatRoom;
//             // const user = await User.findByPk(message.senderId);
//             const currentUser = await User.findByPk(socket.request.user.id);
//             if(!currentUser){
//                 return;
//             }
//             const userchatRooms = await currentUser.getChatRooms({userId: recipientId, chatRoomType: 'normal'});
//             chatRoom = userchatRooms[0];
//             if(chatRoom) console.log('chat between users');

//             if(!chatRoom || chatRoom.length === 0){
//                 chatRoom = await ChatRoom.create();
//                 const userIds = [currentUser.id, recipientId];
//                 console.log(userIds);
//                 if(!userIds || userIds.length !== 2){
//                     return;
//                 }
//                 userIds.forEach(async (userId) => {
//                     // let contactId;
//                     // if(!chatRoom.isGroupChat){
//                     //     if(userId === currentUser.id){
//                     //         contactId = recipientId
//                     //     }
//                     //     else{
//                     //         contactId = currentUser.id
//                     //     }
//                     // }
//                     await ChatInstance.create({
//                         chatRoomId: chatRoom.id,
//                         userId,
//                     })
//                     await Participant.create({
//                         chatRoomId: chatRoom.id,
//                         userId,
//                         userPhoneNumber: 'contactId'
//                     })
//                 });
//                 // await chatRoom.addUsers(userIds);
//                 // await chatRoom.addMembers(userIds);
//                 if(chatRoom) console.log('new chatRoom')
//             }
//             const dat = Object.assign(message, { chatRoomId: chatRoom.id, senderId: currentUser.id, recipientId })

//             const newMessage = await Message.create(dat);
//             if(newMessage){
//                 socket.broadcast.to(newMessage.recipientId).emit(CHAT_INITIATE, chatRoom)
//             }

//         } catch (error) {
//             console.log(error);
//         }
//     })

//     // const { message, userIds } = data;
//     // const user = await User.findByPk(message.senderId);
//     // let chatRoom = await user.getChatRooms({userId: message.recipientId});
//     // console.log(chatRoom)
//     // console.log(message.senderId)
// }

exports.initiateChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { message, otherUserId } = data;
            let chatRoom;
            let participants;

            const currentUser = await User.findByPk(socket.request.user.id);
            if(!currentUser){
                return;
            }
            const userchatRooms = await currentUser.getChatRooms({userId: otherUserId, isGroupChat: false });
            chatRoom = userchatRooms[0];
            if(chatRoom) console.log('chat between users');

            if(!chatRoom || chatRoom.length === 0){
                chatRoom = await ChatRoom.create();
            }
            const dat = Object.assign(message, { chatRoomId: chatRoom.id, senderId: currentUser.id })

            const newMessage = await Message.create(dat);
            const userIds = [currentUser.id, otherUserId];
            
            if(!userIds || userIds.length !== 2){
                return;
            }

            userIds.forEach(async (userId) => {
                participants = await Participant.create({
                    chatRoomId: chatRoom.id,
                    userId,
                    userPhoneNumber: 'contactId'
                })
            });

            userIds.forEach(async (userId) => {
                const chatInstance = await ChatInstance.create({
                    chatRoomId: chatRoom.id,
                    userId,
                })

                const data = {...chatRoom, participants, chatInstance }

                if(newMessage){
                    console.log('new keisk')
                    // socket.emit(CHAT_INITIATE, data)
                }
            });

        } catch (error) {
            console.log(error);
        }
    })
}

exports.openChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { message, recipientId } = data;
            let chatRoom;
            // const user = await User.findByPk(message.senderId);
            const currentUser = socket.request.user
            const ChatInstance = await ChatInstance.findOne({
                userId: currentUser.id,
                contactId: recipientId
            });

            if(!ChatInstance){
                chatRoom = await ChatRoom.create();
                const userIds = [currentUser.id, recipientId];
                console.log(userIds);
                if(!userIds || userIds.length !== 2){
                    return;
                }
                userIds.forEach(async (userId) => {
                    let contactId;
                    if(!chatRoom.isGroupChat){
                        if(userId === currentUser.id){
                            contactId = recipientId
                        }
                        else{
                            contactId = currentUser.id
                        }
                    }
                    await ChatInstance.create({
                        chatRoomId: chatRoom.id,
                        userId,
                        contactId
                    })
                });
            }
            const dat = Object.assign(message, { chatRoomId: chatRoom.id, senderId: currentUser.id, recipientId })

            const newMessage = await Message.create(dat);
            if(newMessage){
                socket.broadcast.to(newMessage.recipientId).emit(CHAT_INITIATE, chat)
            }

        } catch (error) {
            console.log(error);
        }
    })

    // const { message, userIds } = data;
    // const user = await User.findByPk(message.senderId);
    // let chat = await user.getChats({userId: message.recipientId});
    // console.log(chat)
    // console.log(message.senderId)
}

exports.getAllChat = socket => async () => {
    await sequelize.transaction(async t => {
        try {
            const user = socket.request.user;
            // const chas = await ChatInstance.findAll({
            //     where: {
            //         userId: user.id,
            //         isDeleted: false
            //     },
            //     include: [
            //         { 
            //             model: ChatRoom,
            //             include: [
            //                 { 
            //                     model: Message,                                
            //                     where: {
            //                         id: {
            //                             [Op.notIn]: sequelize.literal(`
            //                                 (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = "users"."id")
            //                             `)
            //                         }                                    
            //                     },
            //                     order: [ ['createdAt', 'DESC'] ]
            //                 },
            //                 {
            //                     model: Participant
            //                 }
            //             ]
            //         }
            //     ],
            // });

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
            });

            // socket.emit(CHAT_GETALL, chas)
            socket.emit(CHAT_GETALL, chatRooms)
        } catch (error) {
            console.log(error)
        }
    });
}

exports.getChat = socket => async (chatData) => {
    await sequelize.transaction(async t => {
        try {
            const user = socket.request.user;
            // user.id = '8f540a81-2eb4-4a89-adef-358bc07b7fb9';

            const chatRoom = await ChatRoom.findOne({
                where: {
                    id: {
                        [Op.in]: sequelize.literal(`
                            (SELECT "chatRooms"."id" FROM "chatRooms" INNER JOIN "chatInstances" ON "chatRooms"."id" = "chatInstances"."chatRoomId" WHERE "chatInstances"."isDeleted" = false AND "chatInstances"."userId" = '${user.id}')
                        `)
                    }
                },
                include: [
                    { 
                        model: ChatInstance,
                        where: { 
                            userId: user.id,
                            isDeleted: false
                        },
                        include: {
                            model: Contact
                        }
                    },
                    { 
                        model: Message,
                        order: [ ['createdAt', 'DESC'] ],
                        where: {
                            id: {
                                [Op.notIn]: sequelize.literal(`
                                    (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = '${user.id}')
                                `)
                            }
                        }
                    }
                ],
            });
            socket.emit(CHAT_GETONE, chatRoom)
        } catch (error) {
            console.log(error)
        }
    });

}

exports.muteChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { chatRoomId, isMuted } = data;
            const chatData = { isMuted };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId: socket.request.user.id
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];

            socket.emit(CHAT_UPDATE, updatedChatInstance)
        } catch (error) {
            console.log(error)
        }
    });
}

exports.archiveChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { chatRoomId, isArchived } = data;
            const chatData = { isArchived };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId: socket.request.user.id
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];

            socket.emit(CHAT_UPDATE, updatedChatInstance)
        } catch (error) {
            console.log(error)
        }
    });
}

exports.deleteChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const userId = socket.request.user.id;
            const { chatRoomId } = data;
            const messages = await Message.findAll({ chatRoomId });
            console.log(messages)
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
                    userId: socket.request.user.id
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];

            socket.emit(CHAT_DELETE, updatedChatInstance)
        } catch (error) {
            console.log(error)
        }
    });

}

exports.createGroupChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            // console.log( io.sockets.adapter.rooms)
            // io.sockets.adapter.rooms.get(id).forEach(room => console.log(room))
            // console.log(io.sockets.adapter.sids.get('eDmKyqCvTL9PkWXoAAAC'))
            // const fetch = await io.in(id).fetchSockets()
            // console.log(io.sockets.adapter.rooms)
            
            const { userIds, name } = data;
            if(!name){
                // 1330 - 1479
                return;
            }
            const chatRoom = await ChatRoom.create({ name, isGroupChat: true });
            userIds.forEach(async (userId) => {
                let isOwner = false;
                let isAdmin = false;
                if(socket.request.user.id === userId){
                    isOwner = true;
                    isAdmin = true;
                    // socket.in(chatRoom.id).emit(`${userId} was added you`);
                }
                const chatInstance = await ChatInstance.create({ userId, chatRoomId: chatRoom.id })
                const participant = await Participant.create({ userId, chatRoomId: chatRoom.id, isOwner, isAdmin })
                if(chatInstance && participant){
                    const socketData = socketUsers.find(socketUser => socketUser.userId === userId);
                    if(socketData){
                        const socket = io.sockets.sockets.get(socketData.socketId);
                        socket.join(chatRoom.id)
                        socket.emit(GROUPCHAT_CREATE, 'keiks')
                    }
                }
            });

            socket.emit(GROUPCHAT_CREATE, chatRoom)
        } catch (error) {
            console.log(error)
        }
    });
}

exports.addAdminToGroupChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { otherUserId, chatRoomId } = data;
            console.log(currentUser.id)
            console.log(otherUserId)
            const currentParticipant = await Participant.findOne({
                where: {
                    userId: currentUser.id,
                    chatRoomId
                }
            });

            if(!currentParticipant.isOwner){
                return
            }            
            const otherParticipant = await Participant.update({ isAdmin: true }, { 
                where: {
                    userId: otherUserId,
                    chatRoomId
                }
            });

            if(!otherParticipant){
                return;
            }
            
            console.log(currentParticipant)
            socket.emit(GROUPCHAT_ADDADMIN, otherParticipant);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.removeAdminFromGroupChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { userId, chatRoomId } = data;
            
            const member = await Member.update({ chatRoomId, userId }, {
                isAdmin: false
            });

            if(!member){
                return;
            }
            
            console.log(chat)
            socket.emit(GROUPCHAT_CREATE, member);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.createGroupCha = async (data, callback) => {
    const { userIds, name, avatar } = data;
    if(!userIds || userIds.length < 2){
        console.log(chatData)
        callback({error:'someErrorCode', msg:'Some message'})
    }
    if(!name){
        callback({error:'someErrorCode', msg:'Please provide a name for this group chat'})
    }
    const chatData = {
        name,
        avatar,
        isGroupChat: true
    }
    const chat = await Chat.create(chatData);
    await chat.addUser(userIds);

    socket.emit('groupchat:create', chatData)
}

// {
//     "$gpb":"badoo.bma.User",
//     "user_id":"zAhMACjE3MDIzMDE1NDAIYXpCOAAAAAAgFFTQlNMImqSmOxZPM2ZQ4b8RDEYpAhyQ-CSV0VlpZ5k",
//     "projection":[200,230,700,340,650,640,280,583,580,250,610,560,611,759,630,270,330,871,920,820,830,1120,1423,1436,643,1435,1434],
//     "client_source":127,
//     "access_level":10,
//     "name":"Moderated",
//     "gender":2,
//     "is_deleted":false,
//     "is_invisible":false,
//     "is_unread":true,
//     "online_status":3,
//     "profile_photo":{"$gpb":"badoo.bma.Photo","id":"1373400426","preview_url":"//pd1eu.badoocdn.com/p25/hidden?euri=YhL9dlQAtLE0joRKyag-a3PkAMo3cS7SO4MhA5XljIh5Vz1ttDwilZFCLRX-wKMEwz3ccNwqiQaDHRPvfo3Y.4-wOahWQp97xqVXRFBfHBz7d5rN5UEPf6vC8qscXTLJ-j7r4xQjxtRGKpAaJt3diQ&size=__size__&h=BQz&gs=n&t=5.6.1561.1","large_url":"//pd1eu.badoocdn.com/p25/hidden?euri=Jv9yGUzwcXoccKaLq6kpQmWc4QrOPT2RSRJEUzVYQexsMeH1RGjsRmy9nJNyRtflwO0HkSoi4xXv9zb9O1aBufdcuG3jswe7v3gDYf0sgfTvaNsh-fTh4DkxlOMm46oj3WV.eENISiBBwHLSupoQkUoGMKjc.Hld5XtOT7zI6X0&size=__size__&vp_x1=__vp_x1__&vp_x2=__vp_x2__&vp_y1=__vp_y1__&vp_y2=__vp_y2__&vp_scale=__vp_scale__&wm_left_offs=__wm_offset__&wm_size=__wm_size__&h=BQz&gs=n&t=5.6.1561.1","large_photo_size":{"$gpb":"badoo.bma.PhotoSize","width":0,"height":0},"preview_url_expiration_ts":1648539715,"large_url_expiration_ts":1648539715},
//     "their_vote":2,
//     "is_match":true,
//     "is_crush":false,
//     "is_favourite":false,
//     "favourited_you":false,
//     "is_conversation":false,
//     "unread_messages_count":-1,
//     "allow_add_to_favourites":true,
//     "display_message":"What are you up to Kelvin? 🙂",
//     "is_visitor":false,
//     "update_timestamp":1646313108,
//     "sort_timestamp":1646313108,
//     "origin_folder":41,
//     "connection_status_indicator":0
// },