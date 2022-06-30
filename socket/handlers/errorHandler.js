const { APP_ERROR } = require('../../constants/socketEvents');

module.exports = (socket, msg) => {
    socket.emit(APP_ERROR, msg);
}