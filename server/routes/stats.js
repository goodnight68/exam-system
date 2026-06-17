const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, teacherOnly } = require('../auth');

// 教师：获取统计概览
router.get('/overview', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [questionCount] = await pool.query(
      'SELECT COUNT(*) as total FROM questions WHERE teacher_id=? AND status=1', [req.user.id]
    );
    const [examCount] = await pool.query(
      'SELECT COUNT(*) as total FROM exams WHERE teacher_id=?', [req.user.id]
    );
    const [recordCount] = await pool.query(
      'SELECT COUNT(*) as total FROM exam_records r JOIN exams e ON r.exam_id=e.id WHERE e.teacher_id=?',
      [req.user.id]
    );
    const [avgScore] = await pool.query(
      'SELECT AVG(r.score) as avg FROM exam_records r JOIN exams e ON r.exam_id=e.id WHERE e.teacher_id=? AND r.status=?',
      [req.user.id, 'graded']
    );
    res.json({
      code: 200,
      data: {
        question_count: questionCount[0].total,
        exam_count: examCount[0].total,
        record_count: recordCount[0].total,
        avg_score: Math.round(avgScore[0].avg || 0)
      }
    });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：按分类统计题目数量
router.get('/questions-by-category', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT qc.name, COUNT(q.id) as count
       FROM question_categories qc
       LEFT JOIN questions q ON qc.id = q.category_id AND q.teacher_id=? AND q.status=1
       GROUP BY qc.id, qc.name`,
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：按难度统计题目数量
router.get('/questions-by-difficulty', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT difficulty, COUNT(*) as count
       FROM questions WHERE teacher_id=? AND status=1
       GROUP BY difficulty`,
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：获取个人统计
router.get('/my-overview', authMiddleware, async (req, res) => {
  try {
    const [totalExams] = await pool.query(
      'SELECT COUNT(*) as total FROM exam_records WHERE student_id=?', [req.user.id]
    );
    const [passed] = await pool.query(
      'SELECT COUNT(*) as total FROM exam_records WHERE student_id=? AND is_passed=1', [req.user.id]
    );
    const [avgScore] = await pool.query(
      'SELECT AVG(score) as avg FROM exam_records WHERE student_id=? AND status=?', [req.user.id, 'graded']
    );
    const [recentRecords] = await pool.query(
      `SELECT r.*, e.title as exam_title
       FROM exam_records r JOIN exams e ON r.exam_id=e.id
       WHERE r.student_id=? AND r.status='graded'
       ORDER BY r.submit_time DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({
      code: 200,
      data: {
        total_exams: totalExams[0].total,
        passed_exams: passed[0].total,
        avg_score: Math.round(avgScore[0].avg || 0),
        recent_records: recentRecords
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 考试排名（学生和教师均可查看）
router.get('/ranking/:examId', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.nickname, u.username, r.score, r.submit_time,
        ROW_NUMBER() OVER (ORDER BY r.score DESC) as \`rank\`
       FROM exam_records r JOIN users u ON r.student_id=u.id
       WHERE r.exam_id=? AND r.status='graded'
       ORDER BY r.score DESC`,
      [req.params.examId]
    );
    // 获取当前用户的排名
    let myRank = null;
    if (req.user.role === 'student') {
      const [myRow] = await pool.query(
        `SELECT score, (SELECT COUNT(*)+1 FROM exam_records WHERE exam_id=? AND status='graded' AND score > r.score) as \`rank\`
         FROM exam_records r WHERE exam_id=? AND student_id=? AND status='graded'`,
        [req.params.examId, req.params.examId, req.user.id]
      );
      if (myRow.length > 0) myRank = myRow[0];
    }
    res.json({ code: 200, data: { list: rows, total: rows.length, myRank } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
