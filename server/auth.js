const jwt = require('jsonwebtoken');
const JWT_SECRET = 'exam_system_secret_key_2024';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ code: 401, msg: '请先登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.json({ code: 401, msg: '登录已过期' });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.json({ code: 403, msg: '仅教师/管理员可操作' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.json({ code: 403, msg: '仅管理员可操作' });
  }
  next();
};

module.exports = { authMiddleware, teacherOnly, adminOnly };
