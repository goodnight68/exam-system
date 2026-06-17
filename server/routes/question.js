const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, teacherOnly } = require('../auth');

const TYPE_MAP = { '单选': 'single', '多选': 'multiple', '判断': 'judge', '填空': 'fill', '简答': 'essay' };
const DIFF_MAP = { '简单': 'easy', '中等': 'medium', '困难': 'hard' };

// 获取题目分类列表
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM question_categories ORDER BY id');
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：添加题目
router.post('/', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { category_id, type, difficulty, content, image, options, answer, analysis, score } = req.body;
    if (!category_id || !type || !content || !answer) {
      return res.json({ code: 400, msg: '必填项不能为空' });
    }
    const optionsJson = options ? JSON.stringify(options) : null;
    const [result] = await pool.query(
      'INSERT INTO questions (category_id, type, difficulty, content, image, options, answer, analysis, score, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, type, difficulty || 'medium', content, image || '', optionsJson, answer, analysis || '', score || 5, req.user.id]
    );
    res.json({ code: 200, msg: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：获取全部题目简要列表（用于试卷编辑时选择题目）
router.get('/all', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT q.id, q.content, q.type, q.score, qc.name as category_name FROM questions q LEFT JOIN question_categories qc ON q.category_id=qc.id WHERE q.status=1 AND q.teacher_id=? ORDER BY q.category_id, q.id',
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：随机练习题目（从全题库随机抽取）
router.get('/practice', authMiddleware, async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 20;
    const [rows] = await pool.query(
      'SELECT q.*, qc.name as category_name FROM questions q LEFT JOIN question_categories qc ON q.category_id=qc.id WHERE q.status=1 ORDER BY RAND() LIMIT ?',
      [Math.min(count, 100)]
    );
    rows.forEach(r => { if (typeof r.options === 'string') r.options = JSON.parse(r.options || 'null'); });
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 获取题目列表（支持分页和筛选）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category_id, type, difficulty, keyword } = req.query;
    let sql = 'SELECT q.*, qc.name as category_name, u.nickname as teacher_name FROM questions q LEFT JOIN question_categories qc ON q.category_id = qc.id LEFT JOIN users u ON q.teacher_id = u.id WHERE q.status = 1';
    const params = [];

    if (category_id) { sql += ' AND q.category_id = ?'; params.push(category_id); }
    if (type) { sql += ' AND q.type = ?'; params.push(type); }
    if (difficulty) { sql += ' AND q.difficulty = ?'; params.push(difficulty); }
    if (keyword) { sql += ' AND q.content LIKE ?'; params.push(`%${keyword}%`); }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM (${sql}) t`, params);
    const total = countResult[0].total;

    sql += ' ORDER BY q.create_time DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));
    const [rows] = await pool.query(sql, params);

    rows.forEach(r => { if (typeof r.options === 'string') r.options = JSON.parse(r.options || 'null'); });

    res.json({
      code: 200,
      data: { list: rows, total, page: Number(page), pageSize: Number(pageSize) }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：编辑题目
router.put('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { category_id, type, difficulty, content, image, options, answer, analysis, score } = req.body;
    const optionsJson = options ? JSON.stringify(options) : null;
    await pool.query(
      'UPDATE questions SET category_id=?, type=?, difficulty=?, content=?, image=?, options=?, answer=?, analysis=?, score=? WHERE id=? AND teacher_id=?',
      [category_id, type, difficulty, content, image || '', optionsJson, answer, analysis, score, req.params.id, req.user.id]
    );
    res.json({ code: 200, msg: '更新成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：删除题目
router.delete('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    await pool.query('UPDATE questions SET status=0 WHERE id=? AND teacher_id=?', [req.params.id, req.user.id]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 批量导入题目（文本格式：题型|难度|分类ID|内容|选项(A/B/C/D换行)|答案|解析|分值）
router.post('/import', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { category_id, text } = req.body;
    if (!category_id || !text) return res.json({ code: 400, msg: '分类和题目文本不能为空' });
    const lines = text.split('\n').filter(l => l.trim());
    let imported = 0;
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length < 4) continue;
      const type = TYPE_MAP[parts[0]] || parts[0];
      const difficulty = DIFF_MAP[parts[1]] || parts[1] || 'medium';
      const content = parts[2];
      let options = null;
      let answer = parts[3];
      let analysis = parts.length > 4 ? parts[4] : '';
      const score = parts.length > 5 ? parseFloat(parts[5]) || 5 : 5;
      // 判断/填空/简答无选项
      if (['single', 'multiple'].includes(type)) {
        // 答案可能包含选项文本（用 / 分隔），提取字母部分
        if (answer && /^[A-D,/]+$/.test(answer.replace(/[,/]/g, '').trim().substring(0, 4))) {
          answer = answer.replace(/[,/]/g, '').trim();
        }
      }
      await pool.query(
        'INSERT INTO questions (category_id, type, difficulty, content, options, answer, analysis, score, teacher_id) VALUES (?,?,?,?,?,?,?,?,?)',
        [category_id, type, difficulty, content, options ? JSON.stringify(options) : null, answer, analysis, score, req.user.id]
      );
      imported++;
    }
    res.json({ code: 200, msg: `成功导入 ${imported} 道题目` });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '导入失败: ' + err.message });
  }
});

module.exports = router;
