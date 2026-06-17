const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../auth');

// 获取所有知识点
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT kp.*, (SELECT COUNT(*) FROM questions q WHERE q.kp_id=kp.id AND q.status=1) as question_count
       FROM knowledge_points kp ORDER BY kp.subject, kp.id`
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

module.exports = router;
