const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'iphone-jack-dev-secret-change-in-prod';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload.userId) {
      return res.status(401).json({ error: '无效的登录凭证' });
    }
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  const pool = require('../db');
  pool.query('SELECT role FROM profiles WHERE id = $1', [req.userId])
    .then(({ rows }) => {
      if (rows.length === 0 || rows[0].role !== 'admin') {
        return res.status(403).json({ error: '权限不足' });
      }
      next();
    })
    .catch((err) => {
      console.error('Admin check error:', err);
      res.status(500).json({ error: '服务器错误' });
    });
}

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
