const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const userRoutes = require('./routes/user');
const questionRoutes = require('./routes/question');
const examRoutes = require('./routes/exam');
const statsRoutes = require('./routes/stats');
const wrongbookRoutes = require('./routes/wrongbook');
const announcementRoutes = require('./routes/announcement');
const knowledgeRoutes = require('./routes/knowledge');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// 文件上传配置
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|bmp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/user', userRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/wrongbook', wrongbookRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/admin', adminRoutes);

// 图片上传
const { authMiddleware } = require('./auth');
app.post('/api/upload/image', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.json({ code: 400, msg: '请选择图片文件' });
  res.json({ code: 200, data: { url: '/uploads/' + req.file.filename } });
});

app.get('/api/health', (req, res) => {
  res.json({ code: 200, msg: 'V2.0 服务正常' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`智能考试系统 V2.0: http://localhost:${PORT}`);
  console.log('监听所有网络接口 (0.0.0.0)，同局域网可访问');
});
