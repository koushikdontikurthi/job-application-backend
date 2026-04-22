const bcrypt = require("bcrypt");
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
          
module.exports = { signup };