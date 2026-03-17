const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1");

    return res.status(200).json({
      ok: true,
      message: "Database connected",
      result: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

module.exports = router;