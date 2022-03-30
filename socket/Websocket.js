const {
    createGroupChat,
    changeGroupChatName,
    addAdminToGroupChat,
    removeAdminFromGroupChat,
    initiateChat
} = require('./handlers/chatHandlers');

const {
    sendTextMessage
} = require('./handlers/messsageHandlers');

const {
    CHAT_INITIATE,

    GROUPCHAT_CREATE,
    GROUPCHAT_UPDATENAME,
    GROUPCHAT_UPDATEDESC,
    GROUPCHAT_ADDADMIN,
    GROUPCHAT_REMOVEADMIN,
    GROUPCHAT_LEAVE,
    GROUPCHAT_KICKOUT,

    MESSAGE_SEND,
    MESSAGE_READ
} = require('../constants/socketEvents');

class Websocket{
    constructor(io, socket){
        this.io = io;
        this.socket = socket;
        this.token = socket ? socket.request.headers.authorization : null;
    }

    init(){
        const userId = this.socket.request.user.id;
        const userData = {
            userId,
            socketId: this.socket.id
        };
        socketUsers.push(userData)
        this.socket.join(userId);
        console.log('connected to socket');
        this.setUpEvents();
    }

    setUpEvents(){
        this.socket.on(CHAT_INITIATE, initiateChat(this.socket));
        
        this.socket.on(GROUPCHAT_CREATE, createGroupChat(this.socket));
        this.socket.on(GROUPCHAT_UPDATENAME, changeGroupChatName(this.socket));
        this.socket.on(GROUPCHAT_ADDADMIN, addAdminToGroupChat(this.socket));
        this.socket.on(GROUPCHAT_REMOVEADMIN, removeAdminFromGroupChat(this.socket));
        
        this.socket.on(MESSAGE_SEND, sendTextMessage(this.socket));
    }
}

module.exports = Websocket;