// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utilities/db');
const authQueries = require('../queries/userQueries');
const config = require('../utilities/config');

const saltRounds = 10;

module.exports.register = async (req, res) => {
  const { name,email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Name, Email & password are required.' });
  }

  try {
    const pool = await db.poolPromise;
    const userCheckResult = await pool.request()
      .input('email', db.sql.VarChar, email)
      .query(authQueries.getUserByEmail);

    if (userCheckResult.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, saltRounds);

    const insertResult = await pool.request()
      .input('name', db.sql.VarChar, name)
      .input('email', db.sql.VarChar, email)
      .input('password_hash', db.sql.VarChar, hashed)
      .query(authQueries.createUser);

    const newUser = insertResult.recordset[0];

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email & password are required.' });
  }

  try {
    const result = await db.query(authQueries.getUserByEmail, [
      { name: 'email', type: db.sql.VarChar, value: email }
    ]);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

    return res.json({ message:'User logged in successfully',token, expiresIn: config.JWT_EXPIRES_IN });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};