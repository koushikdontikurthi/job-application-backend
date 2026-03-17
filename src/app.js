const express = require("express");
//const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
app.use(express.json());

app.use("/api", authRoutes);
app.use("/", healthRoutes);


// app.use(errorHandler);
module.exports = app;
