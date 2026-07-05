// src/controllers/auth.controller.js
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { query } = require('../config/db');

const SALT_ROUNDS = 10;
const JWT_SECRET  = process.env.JWT_SECRET    || 'aa_grow_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/* ─── helpers ─────────────────────────────────────────── */
const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const safeUser = (u) => {
  const { password_hash, ...rest } = u;
  return rest;
};

/* ─── REGISTER ────────────────────────────────────────── */
exports.register = async (req, res) => {
  const { name, email, password, role = 'FARMER', phone, farm_name, farm_location, farm_size } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check duplicate email
    const [exists] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, farm_name, farm_location, farm_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hash, role, phone || null, farm_name || null, farm_location || null, farm_size || null]
    );

    const userId = result.insertId;

    // Generate OTP (demo – in production send via email/SMS)
    const otp     = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query(
      'INSERT INTO otp_verifications (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [userId, otp, expires]
    );

    console.log(`📧  OTP for ${email}: ${otp}  (demo – would be emailed in production)`);

    const [newUser] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    const token = generateToken(newUser[0]);

    res.status(201).json({
      message: 'Registration successful. Please verify OTP.',
      token,
      user: safeUser(newUser[0]),
      demo_otp: otp,   // Included for demo/development purposes only
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ─── LOGIN ───────────────────────────────────────────── */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [rows] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user: safeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ─── VERIFY OTP ──────────────────────────────────────── */
exports.verifyOtp = async (req, res) => {
  const { user_id, otp } = req.body;

  if (!user_id || !otp) {
    return res.status(400).json({ error: 'user_id and otp are required.' });
  }

  try {
    const [rows] = await query(
      `SELECT * FROM otp_verifications
       WHERE user_id = ? AND otp_code = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user_id, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    await query('UPDATE otp_verifications SET used = 1 WHERE id = ?', [rows[0].id]);
    await query('UPDATE users SET otp_verified = 1 WHERE id = ?', [user_id]);

    res.json({ message: 'OTP verified successfully.' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ─── RESEND OTP ──────────────────────────────────────── */
exports.resendOtp = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });

  try {
    const [users] = await query('SELECT id, email FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const otp     = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      'INSERT INTO otp_verifications (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [user_id, otp, expires]
    );

    console.log(`📧  New OTP for user ${user_id}: ${otp}`);

    res.json({ message: 'OTP resent successfully.', demo_otp: otp });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ─── GET CURRENT USER (me) ───────────────────────────── */
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

/* ─── UPDATE PROFILE ──────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  const { name, phone, farm_name, farm_location, farm_size } = req.body;

  try {
    await query(
      `UPDATE users SET name = ?, phone = ?, farm_name = ?, farm_location = ?, farm_size = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name          || req.user.name,
        phone         || req.user.phone,
        farm_name     || req.user.farm_name,
        farm_location || req.user.farm_location,
        farm_size     || req.user.farm_size,
        req.user.id,
      ]
    );

    const [updated] = await query(
      'SELECT id, name, email, role, phone, farm_name, farm_location, farm_size, profile_pic, otp_verified FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Profile updated successfully.', user: updated[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ─── CHANGE PASSWORD ─────────────────────────────────── */
exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
    const [rows] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const match  = await bcrypt.compare(current_password, rows[0].password_hash);

    if (!match) return res.status(400).json({ error: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(new_password, SALT_ROUNDS);
    await query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newHash, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
