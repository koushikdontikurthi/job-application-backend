const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../db/query");

const signup = async (req, res, next) =>{
    try {
        const { email,password } = req.body;
        if(!email || !password) {
          return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, passwordHash]
        );

        return res.status(201).json({
          message: 'User created successfully',
          user: result.rows[0]
        });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          code: 'DUPLICATE_EMAIL',
          message: 'Email already exists'
        });
      }
      next(error);
    }
  };

  const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                code: 'VALIDATION_ERROR',
                message: 'Email and password are required'
            });
        }
        const result = await query(
            'SELECT id, email, password_hash FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password'
            });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password'
            });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
          message: 'Login successful',
          token
        });
    } catch (error) {
        next(error);
    }
};
          
module.exports = { signup, login };