const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { sendVerificationCode } = require('../services/mailer');

const router = express.Router();

// Validation helpers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LEN = 128;
const MAX_DISPLAY_NAME_LEN = 50;
const CODE_LEN = 6;
const CODE_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

// ──────────────────────────────────────
// POST /api/auth/send-code — send email verification code
// ──────────────────────────────────────
router.post('/send-code', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: '请输入有效的邮箱地址' });
    }

    // Check if already registered
    const existing = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    // Cooldown: check if a code was sent within the last 60 seconds
    const recent = await pool.query(
      `SELECT id FROM verification_codes
       WHERE email = $1 AND created_at > now() - interval '${RESEND_COOLDOWN_SECONDS} seconds'
       ORDER BY created_at DESC LIMIT 1`,
      [email],
    );
    if (recent.rows.length > 0) {
      return res.status(429).json({ error: `请 ${RESEND_COOLDOWN_SECONDS} 秒后再试` });
    }

    // Generate 6-digit code
    const code = String(crypto.randomInt(0, 1000000)).padStart(CODE_LEN, '0');
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt],
    );

    const { previewUrl } = await sendVerificationCode(email, code);

    res.json({
      success: true,
      message: '验证码已发送',
      // In dev, return preview URL so user can see the email
      ...(previewUrl && { previewUrl }),
    });
  } catch (err) {
    console.error('Send code error:', err);
    res.status(500).json({ error: '发送验证码失败' });
  }
});

// ──────────────────────────────────────
// POST /api/auth/verify-code — verify email code
// ──────────────────────────────────────
router.post('/verify-code', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const code = (req.body.code || '').trim();

    if (!email || !code) {
      return res.status(400).json({ error: '邮箱和验证码必填' });
    }

    // Find the latest unused code for this email
    const { rows } = await pool.query(
      `SELECT id, code, expires_at, attempts, used FROM verification_codes
       WHERE email = $1 AND used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [email],
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: '请先发送验证码' });
    }

    const record = rows[0];

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: '验证码尝试次数过多，请重新获取' });
    }

    // Increment attempts
    await pool.query('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = $1', [record.id]);

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: '验证码已过期，请重新获取' });
    }

    // Check code match
    if (record.code !== code) {
      return res.status(400).json({ error: '验证码错误' });
    }

    // Mark as used
    await pool.query('UPDATE verification_codes SET used = TRUE WHERE id = $1', [record.id]);

    // Issue a short-lived verification token (5 min)
    const verifyToken = jwt.sign({ email, purpose: 'register' }, JWT_SECRET, { expiresIn: '5m' });

    res.json({ success: true, verifyToken });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ error: '验证失败' });
  }
});

// ──────────────────────────────────────
// POST /api/auth/register — complete registration (requires verifyToken)
// ──────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { verifyToken, password, displayName } = req.body;

    if (!verifyToken) {
      return res.status(400).json({ error: '请先验证邮箱' });
    }

    // Verify the short-lived token
    let decoded;
    try {
      decoded = jwt.verify(verifyToken, JWT_SECRET);
      if (decoded.purpose !== 'register') {
        return res.status(400).json({ error: '无效的验证凭证' });
      }
    } catch {
      return res.status(400).json({ error: '验证已过期，请重新验证邮箱' });
    }

    const email = decoded.email;

    // Validate password
    const cleanPassword = (password || '').trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      return res.status(400).json({ error: '密码至少 6 位' });
    }
    if (cleanPassword.length > MAX_PASSWORD_LEN) {
      return res.status(400).json({ error: '密码过长' });
    }

    // Validate displayName
    const cleanName = displayName ? String(displayName).trim().slice(0, MAX_DISPLAY_NAME_LEN) : null;

    // Check if already registered (race condition protection)
    const existing = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    const id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO profiles (id, email, display_name, password_hash) VALUES ($1, $2, $3, $4)',
      [id, email, cleanName, passwordHash],
    );

    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id, email, displayName: cleanName, role: 'user', subscriptionTier: 'free' },
    });
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === '23505') {
      return res.status(400).json({ error: '该邮箱已注册' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: '注册失败' });
  }
});

// ──────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码必填' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, display_name, role, subscription_tier, password_hash FROM profiles WHERE email = $1',
      [email],
    );

    // Always compare (even if user not found) to prevent timing side-channel
    const DUMMY_HASH = '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const user = rows[0];
    const hashToCompare = user ? user.password_hash : DUMMY_HASH;
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;
