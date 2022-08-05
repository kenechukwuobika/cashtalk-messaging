const { APP_ERROR } = require('../../constants/socketEvents');

module.exports = (statusCode, message) => {
    const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    return {
        statusCode,
        status,
        message
    }
    // socket.emit(APP_ERROR, msg);
}