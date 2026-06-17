# 智能在线考试系统

基于移动终端的智能在线考试系统，采用前后端分离架构，支持学生在线考试、自动评分、错题本、防切屏监控等功能。

## 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JS（SPA 单页面应用，移动端 H5）
- **后端**：Node.js + Express（RESTful API）
- **数据库**：MySQL 8.0
- **认证**：JWT（bcryptjs 密码加密）

## 角色权限

| 角色 | 权限 |
|------|------|
| 管理员 | 用户管理、全系统试卷/题库管理、公告/知识点管理、全系统统计 |
| 教师 | 题库管理、试卷管理、成绩查看与导出、简答题批改、公告发布 |
| 学生 | 在线考试、随机练习、错题本、成绩查询、考试排名 |

## 功能特性

- 五种题型：单选、多选、判断、填空、简答
- 客观题实时自动评分，主观题教师手动批改
- 考试倒计时 + 超时自动交卷
- 防切屏检测（切屏超 3 次强制交卷）
- 答案实时保存，支持断点续考
- 错题本自动收录，支持标记已掌握
- 成绩排名与 CSV 导出
- 题目批量导入
- 图片上传

## 快速开始

### 环境要求

- Node.js v24+
- MySQL 8.0

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/goodnight68/exam-system.git
cd exam-system/server

# 2. 安装依赖
npm install

# 3. 初始化数据库（修改 db.js 中的数据库密码）
node init-db.js

# 4. 启动服务（默认端口3000）
node index.js
```

访问 http://localhost:3000

### 数据库配置

修改 `server/db.js`：

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '你的密码',
  database: 'exam_system',
  ...
});
```

## 项目结构

```
exam-system/
├── client/              # 前端 SPA
│   ├── index.html       # 所有页面模板
│   ├── css/style.css    # 移动端样式
│   └── js/
│       ├── api.js       # API 封装（Token 管理）
│       └── app.js       # 主逻辑（页面路由 + 业务）
├── server/              # 后端 Express 服务
│   ├── index.js         # 入口
│   ├── db.js            # MySQL 连接池
│   ├── auth.js          # JWT 认证中间件
│   ├── init.sql         # 建表脚本
│   ├── init-db.js       # 数据库初始化
│   └── routes/          # 路由模块（8个）
│       ├── user.js      # 用户注册/登录
│       ├── question.js  # 题库管理
│       ├── exam.js      # 考试流程
│       ├── stats.js     # 统计排名
│       ├── wrongbook.js # 错题本
│       ├── announcement.js # 公告
│       ├── knowledge.js # 知识点
│       └── admin.js     # 管理员后台
└── docs/
    └── 论文文档.md       # 课程论文
```

## API 概览

| 模块 | 路径前缀 | 接口数 |
|------|----------|--------|
| 用户 | `/api/user` | 4 |
| 题库 | `/api/question` | 8 |
| 考试 | `/api/exam` | 16 |
| 错题本 | `/api/wrongbook` | 5 |
| 公告 | `/api/announcement` | 3 |
| 知识点 | `/api/knowledge` | 1 |
| 统计 | `/api/stats` | 4 |
| 管理员 | `/api/admin` | 21 |
