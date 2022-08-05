const {
    createGroup,
    changeGroupName,
    addAdminToGroup,
    removeAdminFromGroup,
    changeGroupDesc,
    leaveGroup,
    kickFromGroup
} = require('./handlers/chatHandlers');

const {
    sendMessage,
    readMessage,
    deliverMessage,
    startTyping,
    stopTyping,
    deleteMessageEveryone
} = require('./handlers/messsageHandlers');

const {
    GROUPCHAT_CREATE,
    GROUPCHAT_UPDATENAME,
    GROUPCHAT_UPDATEDESC,
    GROUPCHAT_ADDADMIN,
    GROUPCHAT_REMOVEADMIN,
    GROUPCHAT_LEAVE,
    GROUPCHAT_KICKOUT,

    MESSAGE_SEND,
    MESSAGE_READ,
    MESSAGE_DELIVERED,
    MESSAGE_DELETE_EVERYONE,
    TYPING_START,
    TYPING_STOP
} = require('../constants/socketEvents');

const { user, profile } = require('../models')

class Websocket{
    constructor(socket){
        this.user = socket.request.user
        this.socket = socket;
        this.token = socket ? socket.request.headers.authorization : null;
    }

    init(){
        const userData = {
            userId: this.user.id,
            socketId: this.socket.id
        };
        socketUsers.push(userData)
        this.socket.join(this.user.id);
        console.log('connected to socket');
        this.setUpEvents();
    }

    async setUpEvents(){
        this.socket.emit('signInSuccess', this.user);
                
        this.socket.on(GROUPCHAT_CREATE, createGroup(this.socket));
        this.socket.on(GROUPCHAT_UPDATENAME, changeGroupName(this.socket));
        this.socket.on(GROUPCHAT_UPDATEDESC, changeGroupDesc(this.socket));
        this.socket.on(GROUPCHAT_ADDADMIN, addAdminToGroup(this.socket));
        this.socket.on(GROUPCHAT_REMOVEADMIN, removeAdminFromGroup(this.socket));
        this.socket.on(GROUPCHAT_LEAVE, leaveGroup(this.socket));
        this.socket.on(GROUPCHAT_KICKOUT, kickFromGroup(this.socket));
        
        this.socket.on(MESSAGE_SEND, sendMessage(this.socket));
        this.socket.on(MESSAGE_READ, readMessage(this.socket));
        this.socket.on(MESSAGE_DELIVERED, deliverMessage(this.socket));
        this.socket.on(MESSAGE_DELETE_EVERYONE, deleteMessageEveryone(this.socket));
        this.socket.on(TYPING_START, startTyping(this.socket));
        this.socket.on(TYPING_STOP, stopTyping(this.socket));
        this.socket.on('disconnect', (data) => {
            console.log('left')
            console.log(this)
        });
    }
}

module.exports = Websocket;