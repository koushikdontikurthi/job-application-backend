const { pool, query } = require("../db/query");

const createApplication = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { jobId } = req.body;
    const userId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Job id is required"
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO applications (user_id, job_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, job_id) DO NOTHING
       RETURNING id, user_id, job_id, created_at`,
      [userId, jobId]
    );

    const application = result.rows[0];

    if (!application) {
      await client.query("COMMIT");

      return res.status(200).json({
        message: "Application already exists",
        application: null
      });
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Application created successfully",
      application
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

const getApplicationsForJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
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

module.exports = { createApplication, getApplicationsForJob };