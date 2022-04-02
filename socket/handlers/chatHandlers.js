const { Op } = require("sequelize");
const sequelize = require('../../config/database/connection');
const ChatRoom = require('../../models').chatRoom;
const ChatInstance = require('../../models').chatInstance;
const Participant = require('../../models').participant;
const Message = require('../../models').message;
const {
    CHAT_OPEN,
    CHAT_INITIATE,
    GROUPCHAT_CREATE,
    GROUPCHAT_UPDATENAME,
    GROUPCHAT_UPDATEDESC,
    GROUPCHAT_ADDADMIN,
    GROUPCHAT_REMOVEADMIN,
    GROUPCHAT_LEAVE,
    GROUPCHAT_KICKOUT
} = require('../../constants/socketEvents');

exports.initiateChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const { message, recipientId } = data;
            let chatRoom;
            const currentUser = socket.request.user;

            const chatInstance = await ChatInstance.findOne({
                where: {
                    userId: currentUser.id,
                    chatRoomType: 'normal'
                }
            });
           
            if(chatInstance){
                console.log('chat between users');
                chatRoom = await ChatRoom.findByPk(chatInstance.chatRoomId)
            }
            else{
                chatRoom = await ChatRoom.create();
                const messageData = Object.assign(message, { chatRoomId: chatRoom.id, senderId: currentUser.id })
                const newMessage = await Message.create(messageData);
                const userIds = [currentUser.id, recipientId];
                if(!userIds || userIds.length !== 2){
                    return;
                }
    
                userIds.forEach(async (userId) => {

                    await Participant.create({
                        chatRoomId: chatRoom.id,
                        userId,
                        userPhoneNumber: 'contactId'
                    })

                    await ChatInstance.create({
                        chatRoomId: chatRoom.id,
                        userId,
                    })
    
                    socket.to(userId).emit(CHAT_INITIATE, chatRoom.id)
                });
            }

            io.of('/api/v1').in(currentUser.id).emit(CHAT_INITIATE, chatRoom.id)

        } catch (error) {
            console.log(error);
        }
    })
}

exports.createGroupChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { participants, name } = data;
            if(!name){
                // 1330 - 1479
                return;
            }
            const chatRoom = await ChatRoom.create({
                name,
                isGroupChat: true
            })

            participants.forEach(async (user) => {
                let isOwner = false;
                let isAdmin = false;
                
                if(socket.request.user.id === user.id){
                    isOwner = true;
                    isAdmin = true;
                    return;
                }

                const participant = await Participant.create({
                    userId: user.id,
                    chatRoomId: chatRoom.id,
                    userPhoneNumber: user.phoneNumber,
                    isOwner,
                    isAdmin
                })

                const chatInstance = await ChatInstance.create({ 
                    userId: user.id,
                    chatRoomId: chatRoom.id
                })

                if(chatInstance && participant){
                    const socketData = socketUsers.find(socketUser => socketUser.userId === user.id);
                    console.log(socketUsers)
                    console.log(socketData)
                    if(socketData){
                        const socket = io.sockets.sockets.get(socketData.socketId);
                        const data = {
                            ...chatRoom.dataValues,
                            chatInstance,
                            participant
                        }
                        socket.emit(GROUPCHAT_CREATE, data)
                    }
                }
            });

            socket.emit(GROUPCHAT_CREATE, chatRoom)
        } catch (error) {
            console.log(error)
        }
    });
}

exports.changeGroupChatName = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId, name } = data;
            const chatRoom = await ChatRoom.update({
                name              
            },
            {
                where: {
                    id: chatRoomId
                }
            });
            
            socket.emit(GROUPCHAT_ADDADMIN, chatRoom);

        } catch (error) {           
            console.log(error);

            res.status(400).json({
                status: 'fail',
                data: error.message
            });
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
            const otherParticipant = await Participant.update({ isAdmin: false }, { 
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

exports.leaveGroupChat = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId } = data;
            const participant = await Participant.delete({
                where: {
                    userId: currentUser.id,
                    chatRoomId
                }
            });
            
            socket.emit(GROUPCHAT_ADDADMIN, participant);
        } catch (error) {
            console.log(error)
        }
    });
}