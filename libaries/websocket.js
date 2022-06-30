const User = require("../models").user;
const sequelize = require("../config/database/connection");
const { protectRoute } = require("cashtalk-common");

class Websocket{
    constructor(socket){
        this.socket = socket;
        this.token = socket ? socket.request.headers.authorization : null;
    }

    init(){
        this.verifyToken();
    }

    verifyToken(){
        if(!this.token){
            return null;
        }
        console.log('connected to socket');
        const currentUser = protectRoute(this.token, User);
        if(!currentUser){

        }

        this.setUpEvents();
    }

    setUpEvents(){
        socket.on('chat:create', async (chatData) => {
            const { users } = chatData;
            const chat = await Chat.create();
            await chat.addUser(users);
    
            // const queueData = {
            //     type: types.MESSAGE_CREATE,
            //     payload: chat
            // }
    
            // socket.broadcast.to(recipient).emit('chat:create', chat)
    
            // await queue.produce(queueData);
    
        });
    
        socket.on('groupchat:create', async (data, callback) => {
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
        });
    
        socket.on('chat:getAll', async (chatData) => {
            const { userId } = chatData;
            console.log(userId)
            const user = await User.findByPk(userId)
            console.log(socket.id)
            let chats = [];
            if(user) chats = await user.getChats();
            
            // socket.to(userId).emit('chat:getAll', chats)
            socket.in(userId).emit('chat:getAll', chats)
            // const queueData = {
            //     type: types.MESSAGE_CREATE,
            //     payload: chat
            // }
    
            // await queue.produce(queueData);
    
        });
    
        socket.on('chat:getOne', async (chatData) => {
            const { userId } = chatData;
            
            console.log('chatData')
            console.log(chatData)
            // const user = await User.findByPk(userId)
            // const chats = await user.getChats();
    
            // const queueData = {
            //     type: types.MESSAGE_CREATE,
            //     payload: chat
            // }
    
            // socket.broadcast.to(userId).emit('chat:getAll', chats)
    
            // await queue.produce(queueData);
    
        });
    
        socket.on('chat:update', async (chatData) => {
            const { users } = chatData;
            const chat = await Chat.create();
            await chat.addUser(users);
    
            const queueData = {
                type: types.MESSAGE_CREATE,
                payload: chat
            }
    
            socket.broadcast.to(recipient).emit('chat:create', chat)
    
            await queue.produce(queueData);
    
        });
    
        socket.on('chat:delete', async (chatData) => {
            const { chatId } = chatData;
            const chat = await Chat.findByPk(chatId);
            
            if(!chat){
                return socket.broadcast.to(recipient).emit('error:notFound', deletedChat)
            }
    
            if(chat.type !== 'group'){
                return socket.broadcast.to(recipient).emit('error:unAuthorized', deletedChat)
            }
    
            const deletedChat = await Chat.deleteByPk(chatId);
            
            const data = {
                type: types.MESSAGE_CREATE,
                payload: deletedChat
            }
    
            socket.broadcast.to(recipient).emit('chat:delete', deletedChat)
    
            await queue.produce(data);
    
        });
    
        socket.on('message:send', async ({ chatId, text }) => {
            const chat = await Chat.findByPk(chatId);
            if(chat) recipients = await chat.getUsers();
    
            const data = {
                type: types.MESSAGE_CREATE,
                payload: {
                    recipients,
                    text,
                    sender:id
                }
            }
    
            // socket.broadcast.to(recipient).emit('message:send', {
            //     recipients: newRecipients, sender: id, text
            // }, (data) => {
            //     if(data.error){
                    
            //     }
            // })
            
            recipients.forEach(recipient => {
                const newRecipients = recipients.filter(r => r !== recipient)
                newRecipients.push(id)
                socket.broadcast.to(recipient).emit('message:receive', {
                    recipients: newRecipients, sender: id, text
                })
            })
    
            await queue.produce(data);
    
        })
    
        socket.on('message:delete', async ({ chat, recipients, text }) => {
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
    
        })
    
        socket.on('message:read', async ({ chat, recipients, text }) => {
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
    
        })
    }
}

module.exports = Websocket;

io.on('connection', async (socket) => {
    console.log('socket connected')
    const id = socket.handshake.query.id;
    socket.join(id);

});