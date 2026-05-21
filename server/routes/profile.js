const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile — get current user's profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, display_name, role, subscription_tier, created_at FROM profiles WHERE id = $1',
      [req.userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      displayName: u.display_name,
      role: u.role,
      subscriptionTier: u.subscription_tier,
      createdAt: u.created_at,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: '获取资料失败' });
  }
});

module.exports = router;
