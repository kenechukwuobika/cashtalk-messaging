class customError extends Error{
    constructor(message, statusCode) {
        super(message);
    
        this.statusCode = statusCode;
        this.status = 'failkeiks';
        this.isOperational = true;
    
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = customError;