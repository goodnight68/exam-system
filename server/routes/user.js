const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authMiddleware } = require('../auth');

const JWT_SECRET = 'exam_system_secret_key_2024';

router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname, role, gender, birth_date, email, student_no, department } = req.body;
    if (!username || !password || !nickname) {
      return res.json({ code: 400, msg: '用户名、密码和昵称不能为空' });
    }
    if (password.length < 6) {
      return res.json({ code: 400, msg: '密码长度不能少于6位' });
    }
    const [exist] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (exist.length > 0) {
      return res.json({ code: 400, msg: '用户名已存在' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname, role, gender, birth_date, email, student_no, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hash, nickname, role || 'student', gender || 'other', birth_date || null, email || '', student_no || '', department || '']
    );
    res.json({ code: 200, msg: '注册成功', data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ code: 400, msg: '用户名和密码不能为空' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.json({ code: 400, msg: '用户名或密码错误' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.json({ code: 400, msg: '用户名或密码错误' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          gender: user.gender,
          birth_date: user.birth_date,
          email: user.email,
          student_no: user.student_no,
          department: user.department
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.get('/info', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, role, phone, avatar, gender, birth_date, email, student_no, department, create_time FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.json({ code: 404, msg: '用户不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

router.put('/info', authMiddleware, async (req, res) => {
  try {
    const { nickname, phone, gender, birth_date, email, student_no, department, avatar } = req.body;
    await pool.query('UPDATE users SET nickname = ?, phone = ?, gender = ?, birth_date = ?, email = ?, student_no = ?, department = ?, avatar = ? WHERE id = ?',
      [nickname, phone, gender || 'other', birth_date || null, email || '', student_no || '', department || '', avatar || '', req.user.id]);
    res.json({ code: 200, msg: '更新成功' });
  } catch (err) {
    res.json({ code: 500, msg: '服务器错误' });
  }
});

module.exports = router;
