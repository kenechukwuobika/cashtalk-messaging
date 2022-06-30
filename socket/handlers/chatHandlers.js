const { Op } = require("sequelize");
const sequelize = require('../../config/database/connection');
const ChatRoom = require('../../models').chatRoom;
const ChatInstance = require('../../models').chatInstance;
const Participant = require('../../models').participant;
const Message = require('../../models').message;
const {
    CHAT_INITIATE,
    GROUPCHAT_CREATE,
    GROUPCHAT_UPDATENAME,
    GROUPCHAT_UPDATEDESC,
    GROUPCHAT_ADDADMIN,
    GROUPCHAT_REMOVEADMIN,
    GROUPCHAT_LEAVE,
    GROUPCHAT_KICKOUT
} = require('../../constants/socketEvents');

exports.createGroup = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const participants = [];
            const chatInstances = [];
            const currentUser = socket.request.user;
            const { users, name } = data;
            if(!name){
                console.log("Please provide a name");
                return;
            }

            users.forEach(async (user) => {
                let isOwner = false;
                let isAdmin = false;
                
                if(currentUser.id === user){
                    isOwner = true;
                    isAdmin = true;
                }

                const participant = {
                    userId: user,
                    userPhoneNumber: user.phoneNumber,
                    isOwner,
                    isAdmin
                };

                participants.push(participant);

                const chatInstance = {
                    userId: user
                };

                chatInstances.push(chatInstance)
            });

            // console.log(participants)
            // console.log(chatInstances)
            // return

            const chatRoom = await ChatRoom.create({
                name,
                isGroupChat: true,
                chatInstance: [chatInstances],
                participant: [participants]
            }, {
                include: [
                    Participant,
                    ChatInstance
                ]
            });
            
            // socket.emit(GROUPCHAT_CREATE, chatRoom)

            users.forEach(async (user) => {
                io.of('/api/v1').in(user).emit(GROUPCHAT_CREATE, chatRoom)
            })
        } catch (error) {
            console.log(error)
        }
    });
}

exports.changeGroupName = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId, name } = data;
            const participant = await Participant.findOne({
                chatRoomId,
                userId: currentUser.id
            });

            if(!participant){
                return console.log("This user is not a member of this group");
            }

            if(!participant.admin){
                return console.log("Unauthorized! This user is not an admin of this group");
            }

            const chatRoom = await ChatRoom.update({
                name              
            },
            {
                where: {
                    id: chatRoomId
                }
            });
            
            chatRoom.participants.forEach(participant => {
                socket.in(participant.userId).emit(GROUPCHAT_ADDADMIN, chatRoom);
            });

        } catch (error) {           
            console.log(error);
        }
    });

}

exports.changeGroupDesc = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId, desc } = data;
            const participant = await Participant.findOne({
                chatRoomId,
                userId: currentUser.id
            });

            if(!participant){
                return console.log("This user is not a member of this group");
            }

            if(!participant.admin){
                return console.log("Unauthorized! This user is not an admin of this group");
            }

            const chatRoom = await ChatRoom.update({
                desc              
            },
            {
                where: {
                    id: chatRoomId
                }
            });
            
            chatRoom.participants.forEach(participant => {
                socket.in(participant.userId).emit(GROUPCHAT_UPDATEDESC, chatRoom);
            });

        } catch (error) {           
            console.log(error);
        }
    });

}

exports.addAdminToGroup = socket => async (data) => {
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

            if(!currentParticipant.isAdmin){
                return console.log('Unauthorized!')
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
            socket.emit(GROUPCHAT_UPDATENAME, otherParticipant);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.removeAdminFromGroup = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { otherUserId, chatRoomId } = data;
            const currentParticipant = await Participant.findOne({
                where: {
                    userId: currentUser.id,
                    chatRoomId
                }
            });

            if(!currentParticipant.isOwner){
                return console.log("unauthorized")
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
            socket.emit(GROUPCHAT_REMOVEADMIN, otherParticipant);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.leaveGroup = socket => async (data) => {
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
            
            socket.emit(GROUPCHAT_LEAVE, participant);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.kickFromGroup = socket => async (data) => {
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
            
            socket.emit(GROUPCHAT_KICKOUT, participant);
        } catch (error) {
            console.log(error)
        }
    });
}