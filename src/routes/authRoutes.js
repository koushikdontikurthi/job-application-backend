const express = require("express");
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const authMiddleware = require("../middlewares/authMiddleware");
const { validateSignup, validateLogin } = require("../middlewares/validators");


router.post("/signup", validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, me);

module.exports = router;