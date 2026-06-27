function errorHandler(err, req, res, next) {
    const statusCode = err.status || err.statusCode || 500;
    
    console.error(err);

    if (process.env.NODE_ENV === 'development') {
        return res.status(statusCode).json({
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message,
            stack: err.stack
        });
    }

    return res.status(statusCode).json({
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: statusCode === 500 ? 'An unexpected error occurred.' : err.message
    });
}

module.exports = errorHandler;