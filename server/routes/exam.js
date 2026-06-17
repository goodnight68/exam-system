const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, teacherOnly } = require('../auth');

// 教师：创建试卷
router.post('/', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { title, description, duration, total_score, pass_score, question_ids } = req.body;
    if (!title || !duration) {
      return res.json({ code: 400, msg: '试卷名称和考试时长不能为空' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO exams (title, description, duration, total_score, pass_score, status, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description || '', duration, total_score || 100, pass_score || 60, 'draft', req.user.id]
      );
      const examId = result.insertId;
      if (question_ids && question_ids.length > 0) {
        const values = question_ids.map((qid, i) => [examId, qid, i + 1]);
        await conn.query('INSERT INTO exam_questions (exam_id, question_id, sort_order) VALUES ?', [values]);
      }
      await conn.commit();
      res.json({ code: 200, msg: '创建成功', data: { id: examId } });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：获取试卷详情（含题目列表，用于编辑）
router.get('/detail/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [exams] = await pool.query('SELECT * FROM exams WHERE id=? AND teacher_id=?', [req.params.id, req.user.id]);
    if (exams.length === 0) return res.json({ code: 404, msg: '试卷不存在' });
    const exam = exams[0];
    const [questions] = await pool.query(
      `SELECT q.*, eq.sort_order FROM exam_questions eq
       JOIN questions q ON eq.question_id=q.id WHERE eq.exam_id=? ORDER BY eq.sort_order`,
      [exam.id]
    );
    questions.forEach(q => { if (typeof q.options === 'string') q.options = JSON.parse(q.options || 'null'); });
    res.json({ code: 200, data: { exam, questions } });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：编辑试卷
router.put('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { title, description, duration, pass_score, question_ids } = req.body;
    if (!title || !duration) return res.json({ code: 400, msg: '试卷名称和时长不能为空' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'UPDATE exams SET title=?, description=?, duration=?, pass_score=? WHERE id=? AND teacher_id=?',
        [title, description || '', duration, pass_score || 60, req.params.id, req.user.id]
      );
      if (question_ids && question_ids.length > 0) {
        await conn.query('DELETE FROM exam_questions WHERE exam_id=?', [req.params.id]);
        const values = question_ids.map((qid, i) => [req.params.id, qid, i + 1]);
        await conn.query('INSERT INTO exam_questions (exam_id, question_id, sort_order) VALUES ?', [values]);
        const [scores] = await conn.query(
          'SELECT SUM(q.score) as total FROM exam_questions eq JOIN questions q ON eq.question_id=q.id WHERE eq.exam_id=?',
          [req.params.id]
        );
        await conn.query('UPDATE exams SET total_score=? WHERE id=?', [scores[0].total || 100, req.params.id]);
      }
      await conn.commit();
      res.json({ code: 200, msg: '更新成功' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：删除试卷
router.delete('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM exams WHERE id=? AND teacher_id=?', [req.params.id, req.user.id]);
    res.json({ code: 200, msg: '删除成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：发布/关闭试卷
router.put('/:id/status', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE exams SET status=? WHERE id=? AND teacher_id=?',
      [status, req.params.id, req.user.id]);
    res.json({ code: 200, msg: '操作成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：获取自己创建的试卷列表
router.get('/my', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT e.*, (SELECT COUNT(*) FROM exam_records WHERE exam_id=e.id) as total_records FROM exams e WHERE e.teacher_id=? ORDER BY e.create_time DESC',
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：获取可参加的考试列表
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.nickname as teacher_name,
        (SELECT COUNT(*) FROM exam_questions WHERE exam_id=e.id) as question_count,
        (SELECT COUNT(*) FROM exam_records WHERE exam_id=e.id AND student_id=?) as my_attempts
       FROM exams e
       LEFT JOIN users u ON e.teacher_id=u.id
       WHERE e.status='published'
       ORDER BY e.create_time DESC`,
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：开始考试（获取试卷题目，不含答案）
router.get('/:id/start', authMiddleware, async (req, res) => {
  try {
    const [exams] = await pool.query('SELECT * FROM exams WHERE id=? AND status=?', [req.params.id, 'published']);
    if (exams.length === 0) return res.json({ code: 404, msg: '试卷不存在或未发布' });

    const exam = exams[0];

    // 检查是否已有进行中的记录
    const [records] = await pool.query(
      'SELECT * FROM exam_records WHERE exam_id=? AND student_id=? AND status=?',
      [exam.id, req.user.id, 'in_progress']
    );

    if (records.length > 0) {
      const record = records[0];
      const elapsed = Math.floor((Date.now() - new Date(record.start_time).getTime()) / 60000);
      if (elapsed >= exam.duration) {
        // 超时自动提交
        await pool.query('UPDATE exam_records SET status=?, submit_time=NOW() WHERE id=?', ['submitted', record.id]);
        return res.json({ code: 400, msg: '考试时间已过，已自动交卷' });
      }
      const remaining = exam.duration - elapsed;
      const [questions] = await pool.query(
        `SELECT q.*, ea.answer as my_answer FROM exam_questions eq
         JOIN questions q ON eq.question_id=q.id
         LEFT JOIN exam_answers ea ON ea.question_id=q.id AND ea.record_id=?
         WHERE eq.exam_id=? ORDER BY eq.sort_order`,
        [record.id, exam.id]
      );
      questions.forEach(q => { if (typeof q.options === 'string') q.options = JSON.parse(q.options || 'null'); });
      return res.json({ code: 200, data: { record_id: record.id, exam, questions, remaining, start_time: record.start_time } });
    }

    // 创建新考试记录
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [recordResult] = await conn.query(
        'INSERT INTO exam_records (exam_id, student_id, start_time, end_time) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))',
        [exam.id, req.user.id, exam.duration]
      );
      const recordId = recordResult.insertId;

      let questionRows;
      if (exam.is_random) {
        [questionRows] = await conn.query(
          'SELECT eq.question_id FROM exam_questions eq WHERE eq.exam_id=? ORDER BY RAND()',
          [exam.id]
        );
      } else {
        [questionRows] = await conn.query(
          'SELECT eq.question_id FROM exam_questions eq WHERE eq.exam_id=? ORDER BY eq.sort_order',
          [exam.id]
        );
      }

      const qids = questionRows.map(r => r.question_id);
      let questions = [];
      if (qids.length > 0) {
        const [qRows] = await conn.query(
          'SELECT * FROM questions WHERE id IN (?) ORDER BY FIELD(id, ?)',
          [qids, qids]
        );
        questions = qRows;
      }

      // 初始化答题记录
      if (questions.length > 0) {
        const answerValues = questions.map(q => [recordId, q.id, '', null, 0]);
        await conn.query('INSERT INTO exam_answers (record_id, question_id, answer, is_correct, score) VALUES ?', [answerValues]);
      }

      await conn.commit();
      questions.forEach(q => { if (typeof q.options === 'string') q.options = JSON.parse(q.options || 'null'); });

      res.json({
        code: 200,
        data: {
          record_id: recordId,
          exam: { ...exam, question_count: questions.length },
          questions,
          remaining: exam.duration,
          start_time: new Date().toISOString()
        }
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：提交单个答案
router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { record_id, question_id, answer } = req.body;
    const [records] = await pool.query(
      'SELECT * FROM exam_records WHERE id=? AND student_id=? AND status=?',
      [record_id, req.user.id, 'in_progress']
    );
    if (records.length === 0) return res.json({ code: 400, msg: '考试记录不存在或已结束' });

    const [questions] = await pool.query('SELECT * FROM questions WHERE id=?', [question_id]);
    if (questions.length === 0) return res.json({ code: 404, msg: '题目不存在' });

    const question = questions[0];
    let isCorrect = null;
    let score = 0;

    // 客观题自动判分
    if (['single', 'judge'].includes(question.type)) {
      isCorrect = (answer === question.answer || String(answer).toUpperCase() === String(question.answer).toUpperCase()) ? 1 : 0;
      score = isCorrect ? Number(question.score) : 0;
    } else if (question.type === 'multiple') {
      const correct = String(question.answer).toUpperCase().split('').sort().join('');
      const studentAnswer = String(answer).toUpperCase().split('').sort().join('');
      isCorrect = (correct === studentAnswer) ? 1 : 0;
      score = isCorrect ? Number(question.score) : 0;
    }

    await pool.query(
      'UPDATE exam_answers SET answer=?, is_correct=?, score=? WHERE record_id=? AND question_id=?',
      [answer, isCorrect, score, record_id, question_id]
    );

    res.json({ code: 200, msg: '保存成功' });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：提交试卷
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { record_id } = req.body;
    const [records] = await pool.query(
      'SELECT * FROM exam_records WHERE id=? AND student_id=? AND status=?',
      [record_id, req.user.id, 'in_progress']
    );
    if (records.length === 0) return res.json({ code: 400, msg: '考试记录不存在或已结束' });

    const [answers] = await pool.query(
      'SELECT SUM(score) as total_score FROM exam_answers WHERE record_id=?',
      [record_id]
    );
    const score = answers[0].total_score || 0;

    const record = records[0];
    const [exams] = await pool.query('SELECT pass_score FROM exams WHERE id=?', [record.exam_id]);
    const passScore = exams[0]?.pass_score || 60;
    const isPassed = score >= passScore ? 1 : 0;

    await pool.query(
      'UPDATE exam_records SET status=?, submit_time=NOW(), score=?, is_passed=? WHERE id=?',
      ['graded', score, isPassed, record_id]
    );

    // 将错题加入错题本
    const [wrongAnswers] = await pool.query(
      'SELECT question_id, answer FROM exam_answers WHERE record_id=? AND is_correct=0', [record_id]
    );
    for (const wa of wrongAnswers) {
      await pool.query(
        'INSERT IGNORE INTO wrong_book (user_id, question_id, exam_record_id, wrong_answer) VALUES (?,?,?,?)',
        [req.user.id, wa.question_id, record_id, wa.answer]
      );
    }

    res.json({ code: 200, msg: '交卷成功', data: { score, is_passed: isPassed } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：获取考试结果详情
router.get('/result/:record_id', authMiddleware, async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT r.*, e.title as exam_title, e.duration, e.pass_score, e.total_score
       FROM exam_records r JOIN exams e ON r.exam_id=e.id
       WHERE r.id=? AND r.student_id=?`,
      [req.params.record_id, req.user.id]
    );
    if (records.length === 0) return res.json({ code: 404, msg: '记录不存在' });

    const record = records[0];
    const [answers] = await pool.query(
      `SELECT ea.*, q.content, q.type, q.options, q.answer as correct_answer, q.analysis, q.score as question_score
       FROM exam_answers ea JOIN questions q ON ea.question_id=q.id
       WHERE ea.record_id=? ORDER BY q.id`,
      [record.id]
    );
    answers.forEach(a => { if (typeof a.options === 'string') a.options = JSON.parse(a.options || 'null'); });

    res.json({ code: 200, data: { record, answers } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 学生：获取我的考试记录
router.get('/my/records', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, e.title as exam_title, e.duration, e.pass_score
       FROM exam_records r JOIN exams e ON r.exam_id=e.id
       WHERE r.student_id=? ORDER BY r.start_time DESC`,
      [req.user.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：获取某场考试的成绩列表
router.get('/:id/scores', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.nickname, u.username
       FROM exam_records r JOIN users u ON r.student_id=u.id
       WHERE r.exam_id=? AND r.status='graded'
       ORDER BY r.score DESC`,
      [req.params.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

// 教师：导出成绩 CSV
router.get('/:id/scores/export', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.username as 用户名, u.nickname as 昵称, u.student_no as 学号,
       r.score as 得分, r.is_passed as 是否通过, r.submit_time as 提交时间
       FROM exam_records r JOIN users u ON r.student_id=u.id
       WHERE r.exam_id=? AND r.status='graded' ORDER BY r.score DESC`,
      [req.params.id]
    );
    const BOM = '\uFEFF';
    let csv = BOM + '用户名,昵称,学号,得分,是否通过,提交时间\n';
    for (const r of rows) {
      csv += `${r['用户名']},${r['昵称']},${r['学号']},${r['得分']},${r['是否通过']?'是':'否'},${r['提交时间']}\n`;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=scores.csv');
    res.send(csv);
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 教师：每题正确率统计
router.get('/:id/question-stats', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.id, q.content, q.type, q.score,
        COUNT(ea.id) as total_answers,
        SUM(ea.is_correct) as correct_count,
        ROUND(SUM(ea.is_correct)/COUNT(ea.id)*100, 1) as correct_rate
       FROM exam_questions eq
       JOIN questions q ON eq.question_id=q.id
       LEFT JOIN exam_answers ea ON ea.question_id=q.id
       LEFT JOIN exam_records r ON ea.record_id=r.id AND r.status='graded'
       WHERE eq.exam_id=? GROUP BY q.id, q.content, q.type, q.score
       ORDER BY correct_rate ASC`,
      [req.params.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 教师：获取待批改的简答题
router.get('/:id/essays', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ea.id as answer_id, ea.record_id, ea.question_id, ea.answer, ea.score, ea.is_correct,
        q.content, q.score as max_score, q.image,
        u.nickname as student_name, u.username, r.id as record_id_check
       FROM exam_answers ea
       JOIN questions q ON ea.question_id=q.id
       JOIN exam_records r ON ea.record_id=r.id
       JOIN users u ON r.student_id=u.id
       WHERE q.type='essay' AND r.exam_id=? AND r.status IN ('submitted','graded')
       ORDER BY ea.is_correct ASC, r.submit_time DESC`,
      [req.params.id]
    );
    res.json({ code: 200, data: rows });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

// 教师：批改简答题
router.put('/grade/:answer_id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { score, is_correct } = req.body;
    await pool.query(
      'UPDATE exam_answers SET score=?, is_correct=? WHERE id=?',
      [score, is_correct ? 1 : 0, req.params.answer_id]
    );
    // 重算该考试记录总分
    const [ans] = await pool.query('SELECT record_id FROM exam_answers WHERE id=?', [req.params.answer_id]);
    if (ans.length > 0) {
      const recordId = ans[0].record_id;
      const [total] = await pool.query('SELECT SUM(score) as s FROM exam_answers WHERE record_id=?', [recordId]);
      const newScore = total[0].s || 0;
      const [rec] = await pool.query('SELECT * FROM exam_records WHERE id=?', [recordId]);
      if (rec.length > 0) {
        const [exam] = await pool.query('SELECT pass_score FROM exams WHERE id=?', [rec[0].exam_id]);
        const passScore = exam[0]?.pass_score || 60;
        await pool.query(
          'UPDATE exam_records SET score=?, is_passed=?, status=? WHERE id=?',
          [newScore, newScore >= passScore ? 1 : 0, 'graded', recordId]
        );
      }
    }
    res.json({ code: 200, msg: '批改成功' });
  } catch (err) { res.json({ code: 500, msg: '服务器错误' }); }
});

module.exports = router;
