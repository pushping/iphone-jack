const express = require('express');
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, free, paid, usageByFeature] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM profiles'),
      pool.query("SELECT COUNT(*) FROM profiles WHERE subscription_tier = 'free'"),
      pool.query("SELECT COUNT(*) FROM profiles WHERE subscription_tier = 'paid'"),
      pool.query('SELECT feature, COUNT(*)::int as count FROM usage_records GROUP BY feature'),
    ]);

    res.json({
      totalUsers: parseInt(total.rows[0].count),
      freeUsers: parseInt(free.rows[0].count),
      paidUsers: parseInt(paid.rows[0].count),
      usageByFeature: usageByFeature.rows,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: '获取统计失败' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;

    let query = `
      SELECT p.id, p.email, p.display_name, p.role, p.subscription_tier, p.created_at,
        COALESCE(u.usage_count, 0)::int as usage_count
      FROM profiles p
      LEFT JOIN (
        SELECT user_id, COUNT(*) as usage_count FROM usage_records GROUP BY user_id
      ) u ON u.user_id = p.id
    `;
    const params = [];
    let idx = 1;
    if (search) {
      // Escape LIKE special characters
      const escaped = search.replace(/[%_]/g, '\\$&');
      query += ` WHERE p.email ILIKE $${idx++} ESCAPE '\\'`;
      params.push(`%${escaped}%`);
    }
    query += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    res.json(rows.map((r) => ({
      id: r.id,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      subscriptionTier: r.subscription_tier,
      createdAt: r.created_at,
      usageCount: r.usage_count,
    })));
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const { role, subscriptionTier } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: '无效的角色值' });
      }
      updates.push(`role = $${idx++}`);
      params.push(role);
    }
    if (subscriptionTier !== undefined) {
      if (!['free', 'paid'].includes(subscriptionTier)) {
        return res.status(400).json({ error: '无效的套餐值' });
      }
      updates.push(`subscription_tier = $${idx++}`);
      params.push(subscriptionTier);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有可更新的字段' });
    }

    updates.push(`updated_at = now()`);
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id`,
      params,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Admin update error:', err);
    res.status(500).json({ error: '更新失败' });
  }
});

module.exports = router;
