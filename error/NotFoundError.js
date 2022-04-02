const customError = require('./customError');

class NotFoundError extends customError{
    message = "Not Found";
    statusCode = 404;
}

module.exports = NotFoundError;