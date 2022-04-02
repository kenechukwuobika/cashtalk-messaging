const { Op } = require("sequelize");
const { parse: uuidParse } = require("uuid");
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

// exports.readMessage = socket => async (data) => {
//     await sequelize.transaction(async t => {
//         try {
//             const currentUser = socket.request.user;
//             const { chatRoomId } = data;
//             console.log(currentUser.id)
//             const messages = await Message.update({
//                 status: "read",
//                 [Op.ne]: {
//                     senderId: uuidParse(currentUser.id)
//                 }
//             },
//             {
//                 where: {
//                     chatRoomId,
//                     status: "unread"
//                 },
//                 returning: true
//             });

//             const readMessages = messages[1];
//             readMessages.forEach(readMessage => {
//                 readMessage
//             })

//             socket.emit(MESSAGE_READ, messages);
//         } catch (error) {
//             console.log(error)
//         }
//     });
// }

exports.readMessage = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const { chatRoomId } = data;
            console.log(currentUser.id)
            const messages = await Message.update({
                status: "read",
                [Op.ne]: {
                    senderId: uuidParse(currentUser.id)
                }
            },
            {
                where: {
                    chatRoomId,
                    status: "unread"
                },
                returning: true
            });

            const readMessages = messages[1];
            readMessages.forEach(readMessage => {
                readMessage
            })

            socket.emit(MESSAGE_READ, messages);
        } catch (error) {
            console.log(error)
        }
    });
}