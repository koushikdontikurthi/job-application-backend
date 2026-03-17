// src/controllers/authController.js
const requireFields = require("../utils/requireFields");

function signup(req, res) {
  // Step 1: validate input
  const check = requireFields(req.body, ["email", "password"]);

  // Step 2: if invalid, return immediately
  if (!check.ok) {
    return res.status(check.status).json({
      code: "VALIDATION_ERROR",
      message: check.message,
      field: check.field
    });
  }

  // Step 3: if valid, continue (for now just return success)
  return res.status(201).json({
    ok: true,
    message: "Signup input looks good  (DB part later)"
  });
}

module.exports = { signup };