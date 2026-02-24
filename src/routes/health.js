const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

router.get("/ping", (req, res) => {
  return res.status(200).json({ message: "pong" });
});

module.exports = router;