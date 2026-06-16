require('dotenv').config();
const express = require("express");
const timeout = require('connect-timeout');
const rateLimit = require('express-rate-limit');

const cors = require('cors');
const {requestLogger} = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // max 100 requests per IP per window
    message: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
    }
});


app.use(cors());
app.use(limiter);
app.use(express.json({limit: '10kb'}));
app.use(timeout('5s'));
app.use(requestLogger);
app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'server is running' });
});

app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);


app.use('/auth', authRoutes);

app.use(errorHandler);

module.exports = app;