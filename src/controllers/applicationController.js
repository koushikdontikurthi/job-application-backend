const { query } = require("../db/query");

const createApplication = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Job id is required"
      });
    }

    const result = await query(
      "INSERT INTO applications (user_id, job_id) VALUES ($1, $2) RETURNING id, user_id, job_id, created_at",
      [userId, jobId]
    );

    return res.status(201).json({
      message: "Application created successfully",
      application: result.rows[0]
    });
    } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        code: "DUPLICATE_APPLICATION",
        message: "You have already applied to this job"
      });
    }

    next(error);
  }
};

module.exports = { createApplication };