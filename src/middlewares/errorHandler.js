function errorHandler(err, req, res, next) {
    console.error("Error caught:", err);

    const statusCode = err.statusCode || 500;


    res.status(statusCode).json({
        code: err.code || "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred.",
        fields: err.fields || null
    });
}

module.exports = errorHandler;