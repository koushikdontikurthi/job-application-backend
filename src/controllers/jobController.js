const { query } = require("../db/query");

const createJob = async (req, res, next) => {
  try {
    const { title, company } = req.body;
    const userId = req.user.userId;

    if (!title || !company) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Title and company are required"
      });
    }

    const result = await query(
      "INSERT INTO jobs (title, company, user_id) VALUES ($1, $2, $3) RETURNING id, title, company, user_id, created_at",
      [title, company, userId]
    );

    return res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, title, company, created_at FROM jobs ORDER BY created_at DESC LIMIT 20"
    );

    return res.status(200).json({
      jobs: result.rows
    });
  } catch (error) {
    next(error);
  }
};
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      "SELECT id, title, company, created_at FROM jobs WHERE id = $1",
      [id]
    );

    const job = result.rows[0];

    if (!job) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found"
      });
    }

    return res.status(200).json({
      job
    });
  } catch (error) {
    next(error);
  }
};
const updateJob = async (req, res, next) => {
    try {
    const { id } = req.params;
    const { title, company } = req.body;
    const userId = req.user.userId;
    if (!title || !company) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Title and company are required"
      });
    }
    const existingJobResult = await query(
      "SELECT id, user_id FROM jobs WHERE id = $1",
      [id]
    );

    const existingJob = existingJobResult.rows[0];
    if (!existingJob) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found"
      });
    }

    if (existingJob.user_id !== userId) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You are not allowed to update this job"
      });
    }

    const result = await query(
      "UPDATE jobs SET title = $1, company = $2 WHERE id = $3 RETURNING id, title, company, user_id, created_at",
      [title, company, id]
    );

    return res.status(200).json({
      message: "Job updated successfully",
      job: result.rows[0]
    });
    } catch (error) {
        next(error);
    }
};
module.exports = { createJob, getJobs, getJobById, updateJob };