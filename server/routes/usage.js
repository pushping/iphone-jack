const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Subscription limits (must match frontend config/subscriptionLimits.ts)
const LIMITS = {
  free: { prompt_gen: 5, image_analysis: 5, video_gen: 1 },
  paid: { prompt_gen: null, image_analysis: null, video_gen: 20 },
};

// GET /api/usage — get current user's usage records (optimized)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get total counts
    const totalResult = await pool.query(
      'SELECT feature, COUNT(*)::int as count FROM usage_records WHERE user_id = $1 GROUP BY feature',
      [req.userId],
    );

    // Get today's counts via SQL
    const todayResult = await pool.query(
      `SELECT feature, COUNT(*)::int as count FROM usage_records
       WHERE user_id = $1 AND created_at >= date_trunc('day', now())
       GROUP BY feature`,
      [req.userId],
    );

    const counts = { prompt_gen: 0, image_analysis: 0, video_gen: 0 };
    for (const row of totalResult.rows) counts[row.feature] = row.count;

    const todayCounts = { prompt_gen: 0, image_analysis: 0, video_gen: 0 };
    for (const row of todayResult.rows) todayCounts[row.feature] = row.count;

    res.json({ counts, todayCounts });
  } catch (err) {
    console.error('Usage GET error:', err);
    res.status(500).json({ error: '获取用量失败' });
  }
});

// POST /api/usage — record a usage (with server-side limit enforcement)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { feature } = req.body;
    if (!['prompt_gen', 'image_analysis', 'video_gen'].includes(feature)) {
      return res.status(400).json({ error: '无效的功能类型' });
    }

    // Get user's subscription tier
    const { rows: userRows } = await pool.query(
      'SELECT subscription_tier FROM profiles WHERE id = $1',
      [req.userId],
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const tier = userRows[0].subscription_tier;
    const limit = LIMITS[tier][feature];

    // null = unlimited, no check needed
    if (limit !== null) {
      // For paid video_gen, check today's count; otherwise check total
      let countQuery;
      let countParams;
      if (tier === 'paid' && feature === 'video_gen') {
        countQuery = `SELECT COUNT(*)::int as count FROM usage_records WHERE user_id = $1 AND feature = $2 AND created_at >= date_trunc('day', now())`;
        countParams = [req.userId, feature];
      } else {
        countQuery = 'SELECT COUNT(*)::int as count FROM usage_records WHERE user_id = $1 AND feature = $2';
        countParams = [req.userId, feature];
      }

      const { rows: countRows } = await pool.query(countQuery, countParams);
      if (countRows[0].count >= limit) {
        return res.status(403).json({ error: '已达使用上限' });
      }
    }

    await pool.query(
      'INSERT INTO usage_records (user_id, feature) VALUES ($1, $2)',
      [req.userId, feature],
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Usage POST error:', err);
    res.status(500).json({ error: '记录用量失败' });
  }
});

module.exports = router;
