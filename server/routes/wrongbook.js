const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../auth');

// 获取错题本列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const [rows] = await pool.query(
      `SELECT wb.*, q.content, q.type, q.answer as correct_answer, q.analysis, qc.name as category_name
       FROM wrong_book wb JOIN questions q ON wb.question_id=q.id
       LEFT JOIN question_categories qc ON q.category_id=qc.id
       WHERE wb.user_id=? ORDER BY wb.create_time DESC LIMIT ? OFFSET ?`,
      [req.user.id, Number(pageSize), (Number(page)-1)*Number(pageSize)]
    );
    const [total] = await pool.query('SELECT COUNT(*) as c FROM wrong_book WHERE user_id=?', [req.user.id]);
    rows.forEach(r => { if (typeof r.type === 'string' && r.options) {/* skip */} });
    res.json({ code: 200, data: { list: rows, total: total[0].c } });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 标记已掌握
router.put('/:id/mark', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE wrong_book SET mastered=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ code: 200, msg: '已标记为掌握' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 删除错题
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM wrong_book WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 获取错题统计
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as c FROM wrong_book WHERE user_id=?', [req.user.id]);
    const [mastered] = await pool.query('SELECT COUNT(*) as c FROM wrong_book WHERE user_id=? AND mastered=1', [req.user.id]);
    const [byCat] = await pool.query(
      `SELECT qc.name, COUNT(*) as cnt FROM wrong_book wb
       JOIN questions q ON wb.question_id=q.id
       JOIN question_categories qc ON q.category_id=qc.id
       WHERE wb.user_id=? GROUP BY qc.id, qc.name`, [req.user.id]);
    res.json({ code: 200, data: { total: total[0].c, mastered: mastered[0].c, by_category: byCat } });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 练习模式：记录错题（无需 exam_record_id）
router.post('/practice', authMiddleware, async (req, res) => {
  try {
    const { question_id, wrong_answer } = req.body;
    if (!question_id) return res.json({ code: 400, msg: '缺少题目ID' });
    // 检查是否已存在，存在则增加复习次数，不存在则新增
    const [exist] = await pool.query(
      'SELECT id FROM wrong_book WHERE user_id=? AND question_id=? AND exam_record_id IS NULL',
      [req.user.id, question_id]
    );
    if (exist.length > 0) {
      await pool.query(
        'UPDATE wrong_book SET wrong_answer=?, review_count=review_count+1, mastered=0 WHERE id=?',
        [wrong_answer || '', exist[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO wrong_book (user_id, question_id, wrong_answer) VALUES (?,?,?)',
        [req.user.id, question_id, wrong_answer || '']
      );
    }
    res.json({ code: 200, msg: '已记录' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

module.exports = router;
