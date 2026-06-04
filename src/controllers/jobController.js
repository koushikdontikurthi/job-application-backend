const { query } = require("../db/query");

const createJob = async (req, res, next) => {
  try {
    const { title, company } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Title and company are required"
      });
    }

    const result = await query(
      "INSERT INTO jobs (title, company) VALUES ($1, $2) RETURNING id, title, company, created_at",
      [title, company]
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

module.exports = { createJob, getJobs };