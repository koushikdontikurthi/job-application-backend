const {query} = require("../db/query");

const createJob = async (title, company, userId) => {
  const result = await query(
    "INSERT INTO jobs (title, company, user_id) VALUES ($1, $2, $3) RETURNING id, title, company, user_id, created_at", 
    [title, company, userId]
  );
  return result.rows[0];
}

const getJobs = async () => {
  const result = await query(
    "SELECT id, title, company, user_id, created_at FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 20"
  );
  return result.rows;
}   

const getJobById = async (id) => {
  const result = await query(
    "SELECT id, title, company, user_id, created_at FROM jobs WHERE id = $1 AND deleted_at IS NULL",    
    [id]
    );
    return result.rows[0];
}

const updateJob = async (id, title, company, userId) => {
    const existing = await query(
        "SELECT id, user_id FROM jobs WHERE id = $1",
        [id]
    );
    const job = existing.rows[0];
    if (!job) return null;
    if (job.user_id !== userId) throw { status: 403, code: 'FORBIDDEN', message: 'You are not allowed to update this job' };

    const result = await query(
        "UPDATE jobs SET title = $1, company = $2 WHERE id = $3 RETURNING id, title, company, user_id, created_at",
        [title, company, id]
    );
    return result.rows[0];
};
const deleteJob = async (id, userId) => {
  const result = await query(
    "UPDATE jobs SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id",
    [id, userId]
    );
    return result.rows[0];
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
};