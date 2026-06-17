const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, teacherOnly } = require('../auth');

// 获取公告列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.nickname as publisher_name FROM announcements a
       JOIN users u ON a.publisher_id=u.id ORDER BY a.is_top DESC, a.create_time DESC LIMIT 20`
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 发布公告
router.post('/', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.json({ code: 400, msg: '标题和内容不能为空' });
    await pool.query('INSERT INTO announcements (title,content,publisher_id) VALUES (?,?,?)',
      [title, content, req.user.id]);
    res.json({ code: 200, msg: '发布成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 删除公告
router.delete('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id=?', [req.params.id]);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

module.exports = router;
