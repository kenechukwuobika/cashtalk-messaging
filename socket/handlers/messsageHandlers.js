const { Op } = require("sequelize");
const sequelize = require('../../config/database/connection');
const Message = require('../../models').message;
const ChatRoom = require('../../models').chatRoom;
const Participant = require('../../models').participant;
const {
    MESSAGE_READ,
    MESSAGE_SEND
} = require('../../constants/socketEvents');

exports.sendTextMessage = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { text, type, chatRoomId, parentMesageId } = data;
            const participants = await Participant.findAll({
                where: {
                    chatRoomId
                }
            })
            const message = { text, type, chatRoomId, parentMesageId, senderId: currentUser.id };
            const newMessage = await Message.create(message);
            participants.forEach(participant => {
                socket.to(participant.userId).emit(MESSAGE_SEND, newMessage);    
            });

        } catch (error) {
            console.log(error)
        }
    });
}

exports.readMessage = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { message } = data;
            const newMessage = await Message.create(message);

            socket.emit(MESSAGE_SEND, newMessage);
        } catch (error) {
            console.log(error)
        }
    });
}