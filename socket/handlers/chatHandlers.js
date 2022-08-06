const { Op } = require("sequelize");
const sequelize = require('../../config/database/connection');
const {
    ChatRoom,
    ChatInstance,
    Participant,
    Message
} = require('../../models');

const errorHandler = require("./errorHandler");

const {
    GROUPCHAT_CREATE,
    GROUPCHAT_UPDATENAME,
    GROUPCHAT_UPDATEDESC,
    GROUPCHAT_ADDADMIN,
    GROUPCHAT_REMOVEADMIN,
    GROUPCHAT_LEAVE,
    GROUPCHAT_KICKOUT
} = require('../../constants/socketEvents');

const {
    MESSAGE_SEND
} = require('../../constants/socketEvents');

exports.createGroup = socket => async (data, callback) => {
    await sequelize.transaction(async t => {
        try {
            const participants = [];
            const chatInstances = [];
            const currentUser = socket.request.user;
            const { users, name } = data;
            if(!name){
                return callback(errorHandler(400, "Please provide a name"));
            }

            users.forEach(async (user) => {
                let isOwner = false;
                let isAdmin = false;
                
                if(currentUser.id === user.id){
                    isOwner = true;
                    isAdmin = true;
                }

                const participant = {
                    userId: user.id,
                    userPhoneNumber: user.phoneNumber,
                    isOwner,
                    isAdmin
                };

                participants.push(participant);

                const chatInstance = {
                    userId: user.id
                };

                chatInstances.push(chatInstance)
            });

            if(participants.length < 2){
                return callback(errorHandler(400, "There must be at least two participants in a group"));
            }

            console.log(participants)

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

            users.forEach(async (user) => {
                io.of('/api/v1').in(user.id).emit(GROUPCHAT_CREATE, chatRoom)
            })
        } catch (error) {
            console.log(error)
            return callback(errorHandler(500, "Something went wrong"));
        }
    });
}

exports.changeGroupName = socket => async (data, callback) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId, name } = data;
            const participant = await Participant.findOne({
                chatRoomId,
                userId: currentUser.id
            });

            if(!participant){
                return callback(errorHandler(404, "This user is not a member of this group"));
            }

            if(!participant.admin){
                return callback(errorHandler(401, "Unauthorized! This user is not an admin of this group"));
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
                return callback(errorHandler(404, "This user is not a member of this group"));
            }

            if(!participant.admin){
                return callback(errorHandler(401, "Unauthorized! This user is not an admin of this group"));
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

exports.addAdminToGroup = socket => async (data, callback) => {
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
                return callback(errorHandler(401, 'Unauthorized!'));
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
            
            socket.emit(GROUPCHAT_UPDATENAME, otherParticipant);
        } catch (error) {
            callback(errorHandler(500, "Something went wrong"))
        }
    });
}

exports.removeAdminFromGroup = socket => async (data, callback) => {
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
                return callback(errorHandler(401, "unauthorized"))
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
            
            socket.emit(GROUPCHAT_REMOVEADMIN, otherParticipant);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.leaveGroup = socket => async (data, callback) => {
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

exports.kickFromGroup = socket => async (data, callback) => {
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
            callback(errorHandler(500, "Something went wrong"))
        }
    });
}