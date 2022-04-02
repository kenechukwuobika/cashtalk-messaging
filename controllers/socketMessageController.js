const User = require('../models').user;
const ChatRoom = require('../models').chatRoom;
const ChatInstance = require('../models').chatInstance;
const Message = require('../models').message;
const { MESSAGE_SEND } = require('../constants/socketEvents');
const socketEvents = require('../constants/socketEvents');
const Member = require('../models').member;

exports.verify = null;

exports.getAllMessages = socket => async ({ userId }) => {
    const messages = await Message.findAll({
        where: {
            id: {
                [Op.notIn]: sequelize.literal(`
                    (SELECT "messages"."id" FROM "messages" INNER JOIN "deletedMessages" ON "messages"."id" = "deletedMessages"."messageId" INNER JOIN "users" ON "users"."id" = "deletedMessages"."userId" WHERE "messages"."id" = "deletedMessages"."messageId" AND "deletedMessages"."userId" = "users"."id")
                `)
            }
        }
    });
    socket.to(userId).emit(socketEvents.MESSAGE_GETALL, messages)
}

exports.messageSend = socket => async (data) => {
    try {
        const { message } = data;
        let chat;
        if(!message.type){
            console.log('Message type not included')
            return;
        }
        if(!message.chatRoomId){
            console.log('no chat id')
            return;
        }  
        if(message.type === 'text'){
            if(!message.text){
                console.log('Message text not included')
                return;
            }
        }
        
            let chatInstance;
            if(message.recipientGroupId){
                recipient = message.recipientGroupId;
                const chatRoom = ChatRoom.findByPk(recipient, {
                    include: {
                        model: Participant
                    }
                });
                if(chatRoom){
                    chatRoom.particpants.forEach(async particpant => {
                        chatInstance = await ChatInstance.update({ isDeleted: false }, { 
                            where: {
                                userId: particpant.userId,
                                chatRoomId: message.chatRoomId
                            },
                            returning: true
                        });
                    })
                }
            }
            else{
                recipient = message.recipientId
                chatInstance = await ChatInstance.update({ isDeleted: false }, { 
                    where: {
                        userId: recipient,
                        chatRoomId: message.chatRoomId
                    },
                    returning: true
                });
            }
            console.log(chatInstance)
            if(chatInstance[0] === 0){
                console.log('chat does not exist')
                return;
            }
            const newMessage = await Message.create(message);
            
            return socket.to(recipient).emit(MESSAGE_SEND, newMessage)

        // if(chat.isGroupChat === true){
        //     return socket.broadcast.to(chat.id).emit('message:send', {
        //         recipients: newRecipients, sender: id, text
        //     }, (data) => {
        //         if(data.error){
                    
        //         }
        //     })
        // }
    } catch (error) {
        console.log(error)
    }

    // const { message, userIds } = data;
    // const user = await User.findByPk(message.senderId);
    // let chat = await user.getChats({userId: message.recipientId});
    // console.log(chat)
    // console.log(message.senderId)
}

exports.messageDelete = async ({ chat, recipients, text }) => {
    let recipient = null;
    if(chat.type !== 'group'){
        recipient = chat.users
    }

    const data = {
        type: types.MESSAGE_CREATE,
        payload: {
            recipients,
            text,
            sender:id
        }
    }

    socket.broadcast.to(recipient).emit('message:send', {
        recipients: newRecipients, sender: id, text
    })
    
    // recipients.forEach(recipient => {
    //     const newRecipients = recipients.filter(r => r !== recipient)
    //     newRecipients.push(id)
    //     socket.broadcast.to(recipient).emit('receive-message', {
    //         recipients: newRecipients, sender: id, text
    //     })
    // })

    await queue.produce(data);

}

exports.messageRead = async ({ chat, recipients, text }) => {
    let recipient = null;
    if(chat.type !== 'group'){
        recipient = chat.users
    }

    const data = {
        type: types.MESSAGE_CREATE,
        payload: {
            recipients,
            text,
            sender:id
        }
    }

    socket.broadcast.to(recipient).emit('message:send', {
        recipients: newRecipients, sender: id, text
    })
    
    // recipients.forEach(recipient => {
    //     const newRecipients = recipients.filter(r => r !== recipient)
    //     newRecipients.push(id)
    //     socket.broadcast.to(recipient).emit('receive-message', {
    //         recipients: newRecipients, sender: id, text
    //     })
    // })

    await queue.produce(data);

}