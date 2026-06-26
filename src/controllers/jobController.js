const { query } = require("../db/query");
const {get, set, del} = require("../cache");

const createJob = async (req, res, next) => {
  try {
    const { title, company } = req.body;
    const userId = req.user.userId;

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
    "SELECT id, title, company, user_id, created_at FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 20"
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
    const cacheKey = `job_${id}`;
    const cachedJob = get(cacheKey);
    if (cachedJob) {
      return res.status(200).json({ job: cachedJob });
    }


    const result = await query(
      "SELECT id, title, company, user_id, created_at FROM jobs WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    const job = result.rows[0];

    if (!job) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found"
      });
    }

    set(cacheKey, job, 60000); // Cache for 1 minute
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
    del(`job_${id}`);
    return res.status(200).json({
      message: "Job updated successfully",
      job: result.rows[0]
    });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const existingJobResult = await query(
      "UPDATE jobs SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );
    const existingJob = existingJobResult.rows[0];
    if (!existingJob) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found or you are not allowed to delete this job"
      });
    }
    del(`job_${id}`);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };