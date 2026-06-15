const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { createApplication, getMyApplications} = require("../controllers/applicationController");
const { validateCreateApplication } = require("../middlewares/validators");


router.post("/", authMiddleware, validateCreateApplication, createApplication);
router.get("/me", authMiddleware, getMyApplications);

module.exports = router;