const express = require("express");
const app = express();

app.use(express.json());

const healthRoutes = require("./routes/health");
app.use("/", healthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));