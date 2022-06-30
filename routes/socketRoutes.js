const chatRoute = require("./chatRoute");
const messageRoute = require("./messageRoute");

module.exports = (app, io) => {
  const router = require("express").Router();
  const socketMessageController = require("../controllers/socketMessageController");
  const socketchatController = require("../controllers/socketchatController");
  const socketEvents = require('../constants/socketEvents');
  const wrap = require('../utilities/middlewareWrapper');
  const { protectRoute } = require("cashtalk-common");

  router.use('/chats', chatRoute);
  router.use('/messages', messageRoute);

  io.use(wrap(protectRoute));

  io.on('connection', socket => {
    const id = socket.request.user.id;
    // const id = socket.handshake.query.id;
    console.log(id);
    const userData = {
        userId: id,
        socketId: socket.id
    }
    socketUsers.push(userData)
    socket.join(id);
    console.log('connected to socket');
    
    socket.on(socketEvents.CHAT_OPEN, socketchatController.openChat(socket));
    socket.on(socketEvents.CHAT_INITIATE, socketchatController.initiateChat(socket));
    socket.on(socketEvents.CHAT_GETALL, socketchatController.getAllChat(socket));
    socket.on(socketEvents.CHAT_GETONE, socketchatController.getChat(socket));
    socket.on(socketEvents.CHAT_MUTE, socketchatController.muteChat(socket));
    socket.on(socketEvents.CHAT_ARCHIVE, socketchatController.archiveChat(socket));
    socket.on(socketEvents.CHAT_DELETE, socketchatController.deleteChat(socket));
  
    socket.on(socketEvents.GROUPCHAT_CREATE, socketchatController.createGroupChat(socket));
    socket.on(socketEvents.GROUPCHAT_ADDADMIN, socketchatController.addAdminToGroupChat(socket));
  
    socket.on(socketEvents.MESSAGE_GETALL, socketMessageController.getAllMessages(socket))
    
    socket.on(socketEvents.MESSAGE_SEND, socketMessageController.messageSend(socket))
  
    // socket.on(socketEvents.MESSAGE_DELETE, socketMessageController.messageDelete(socket))
    
    // socket.on(socketEvents.MESSAGE_DELETE, socketMessageController.messageRead(socket))
  });

  app.use("", router);
};
