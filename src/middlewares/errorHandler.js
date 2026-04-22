function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
    });
}

module.exports = errorHandler;