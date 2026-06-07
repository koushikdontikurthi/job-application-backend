const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require("../controllers/jobController");
const {getApplicationsForJob} = require("../controllers/applicationController");

router.post("/", authMiddleware, createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);
router.get("/:id/applications",authMiddleware, getApplicationsForJob);

module.exports = router;