const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { createApplication } = require("../controllers/applicationController");

router.post("/", authMiddleware, createApplication);

module.exports = router;