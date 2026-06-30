const { query, withTransaction } = require("../db/query");

const createApplication = async (req, res, next) => {
    const { jobId } = req.body;
    const userId = req.user.userId;

    try{
    const result = await withTransaction(async (client) => {
      return await client.query(
        `INSERT INTO applications (user_id, job_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, job_id) DO NOTHING
         RETURNING id, user_id, job_id, created_at`,
        [userId, jobId]
      );
    });

    const application = result.rows[0];

    if (!application) {
      return res.status(200).json({
        message: "Application already exists",
        application: null
      });
    }

    return res.status(201).json({
      message: "Application created successfully",
      application
    });
  } catch (error) {
    next(error);
  } 
};

const getApplicationsForJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = Number(req.query.page) || 1;
    const MAX_LIMIT = 50;
    const DEFAULT_LIMIT = 20;

    let limit = Number(req.query.limit) || DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 1) limit = DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT
         a.id AS application_id,
         a.job_id,
         a.user_id,
         u.email AS applicant_email,
         a.created_at AS applied_at
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    return res.status(200).json({
      page,
      limit,
      applications: result.rows
    });
  } catch (error) {
    next(error);
  }
};
const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT
         a.id AS application_id,
         a.job_id,
         j.title,
         j.company,
         a.created_at AS applied_at
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC, a.id DESC`,
      [userId]
    );

    return res.status(200).json({
      applications: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createApplication, getApplicationsForJob, getMyApplications };