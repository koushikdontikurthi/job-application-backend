require('dotenv').config();
const express = require("express");
const app = express();

const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

app.use(express.json());
app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'server is running' });
});

app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);


app.use('/auth', authRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
