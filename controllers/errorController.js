class errorController extends Error {
    constructor(message, statusCode, socket) {
        super(message);
    
        this.statusCode = statusCode;
        this.socket = socket;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.init();
        // Error.captureStackTrace(this, this.constructor);

    }

    init(){
        const data = {
            statusCode: this.statusCode,
            status: this.status,
            message: this.message
        }
        console.log(data)
        return this.socket.emit('custom_error', data)
    }
}

module.exports = errorController;