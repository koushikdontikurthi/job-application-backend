const requestLogger = (req, res, next) => {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const start = Date.now();

    req.requestId = requestId;

    console.log(`[${requestId}] ${req.method} ${req.url}`);
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${requestId}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
};

module.exports = {requestLogger};