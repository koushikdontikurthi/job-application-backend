const { pool } = require("../db/query");

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

module.exports = { createApplication };