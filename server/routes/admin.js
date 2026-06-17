const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../auth');

// 获取所有用户
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, role, phone, gender, birth_date, email, student_no, department, status, create_time FROM users ORDER BY create_time DESC'
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 创建用户（管理员直接创建）
router.post('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, nickname, role, gender, birth_date, email, student_no, department } = req.body;
    if (!username || !password || !nickname) return res.json({ code: 400, msg: '必填项不能为空' });
    const [exist] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
    if (exist.length > 0) return res.json({ code: 400, msg: '用户名已存在' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username,password,nickname,role,gender,birth_date,email,student_no,department) VALUES (?,?,?,?,?,?,?,?,?)',
      [username, hash, nickname, role || 'student', gender || 'other', birth_date || null, email || '', student_no || '', department || '']);
    res.json({ code: 200, msg: '创建成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 编辑用户信息
router.put('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { nickname, role, phone, gender, birth_date, email, student_no, department } = req.body;
    await pool.query('UPDATE users SET nickname=?, role=?, phone=?, gender=?, birth_date=?, email=?, student_no=?, department=? WHERE id=? AND role!=?',
      [nickname, role, phone, gender || 'other', birth_date || null, email || '', student_no || '', department || '', req.params.id, 'admin']);
    res.json({ code: 200, msg: '更新成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 重置用户密码
router.put('/users/:id/password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.json({ code: 400, msg: '密码至少6位' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password=? WHERE id=?', [hash, req.params.id]);
    res.json({ code: 200, msg: '密码已重置' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 禁用/启用用户
router.put('/users/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE users SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ code: 200, msg: '操作成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 删除用户
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=? AND role!=?', [req.params.id, 'admin']);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 查看所有试卷（不限教师）
router.get('/exams', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.nickname as teacher_name, (SELECT COUNT(*) FROM exam_records WHERE exam_id=e.id) as total_records
       FROM exams e LEFT JOIN users u ON e.teacher_id=u.id ORDER BY e.create_time DESC`
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 删除任意试卷
router.delete('/exams/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM exams WHERE id=?', [req.params.id]);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 查看所有题目
router.get('/questions', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.*, qc.name as category_name, u.nickname as teacher_name
       FROM questions q LEFT JOIN question_categories qc ON q.category_id=qc.id
       LEFT JOIN users u ON q.teacher_id=u.id WHERE q.status=1 ORDER BY q.create_time DESC LIMIT 200`
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 删除任意题目（硬删除）
router.delete('/questions/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id=?', [req.params.id]);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 全系统统计
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as c FROM users');
    const [questions] = await pool.query('SELECT COUNT(*) as c FROM questions WHERE status=1');
    const [exams] = await pool.query('SELECT COUNT(*) as c FROM exams');
    const [records] = await pool.query('SELECT COUNT(*) as c FROM exam_records');
    const [avgScore] = await pool.query('SELECT AVG(score) as a FROM exam_records WHERE status=?', ['graded']);
    const [byRole] = await pool.query('SELECT role, COUNT(*) as c FROM users GROUP BY role');
    res.json({
      code: 200, data: {
        total_users: users[0].c, total_questions: questions[0].c,
        total_exams: exams[0].c, total_records: records[0].c,
        avg_score: Math.round(avgScore[0].a || 0), by_role: byRole
      }
    });
  } catch (err) { console.error(err); res.json({ code: 500, msg: '服务器错误' }); }
});

// ===== 公告管理 =====
router.get('/announcements', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.nickname as publisher_name FROM announcements a JOIN users u ON a.publisher_id=u.id ORDER BY a.is_top DESC, a.create_time DESC'
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

router.post('/announcements', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, content, is_top } = req.body;
    if (!title || !content) return res.json({ code: 400, msg: '标题和内容不能为空' });
    await pool.query('INSERT INTO announcements (title,content,publisher_id,is_top) VALUES (?,?,?,?)',
      [title, content, req.user.id, is_top ? 1 : 0]);
    res.json({ code: 200, msg: '发布成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

router.put('/announcements/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, content, is_top } = req.body;
    await pool.query('UPDATE announcements SET title=?, content=?, is_top=? WHERE id=?',
      [title, content, is_top ? 1 : 0, req.params.id]);
    res.json({ code: 200, msg: '更新成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

router.delete('/announcements/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id=?', [req.params.id]);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// ===== 知识点管理 =====
router.get('/knowledge', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT kp.*, (SELECT COUNT(*) FROM questions q WHERE q.kp_id=kp.id AND q.status=1) as question_count FROM knowledge_points kp ORDER BY kp.id'
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

router.post('/knowledge', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, subject, description } = req.body;
    if (!name) return res.json({ code: 400, msg: '知识点名称不能为空' });
    await pool.query('INSERT INTO knowledge_points (name,subject,description) VALUES (?,?,?)',
      [name, subject || '', description || '']);
    res.json({ code: 200, msg: '创建成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

router.put('/knowledge/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, subject, description } = req.body;
    await pool.query('UPDATE knowledge_points SET name=?, subject=?, description=? WHERE id=?',
      [name, subject, description, req.params.id]);
    res.json({ code: 200, msg: '更新成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

router.delete('/knowledge/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM knowledge_points WHERE id=?', [req.params.id]);
    res.json({ code: 200, msg: '已删除' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// ===== 查看所有考试成绩 =====
router.get('/scores', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.nickname, u.username, e.title as exam_title
       FROM exam_records r JOIN users u ON r.student_id=u.id JOIN exams e ON r.exam_id=e.id
       WHERE r.status='graded' ORDER BY r.submit_time DESC LIMIT 200`
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

module.exports = router;
