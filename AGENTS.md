# AGENTS.md — 智能在线考试系统

## 项目位置
```
C:\Users\Lenovo\AppData\Local\Temp\opencode\exam-system\
```

## 环境要求
- Node.js v24+
- MySQL 8.0 (root / 123456)
- Windows PowerShell 禁止执行脚本，npm 需通过 cmd 运行

## 启动命令

```bash
# 1. 初始化数据库（仅首次）
cmd /c "cd /d C:\Users\Lenovo\AppData\Local\Temp\opencode\exam-system\server && node init-db.js"

# 2. 安装依赖（首次）
cmd /c "cd /d C:\Users\Lenovo\AppData\Local\Temp\opencode\exam-system\server && npm install"

# 3. 启动服务（端口3000）
cmd /c "cd /d C:\Users\Lenovo\AppData\Local\Temp\opencode\exam-system\server && node index.js"

# 4. 停止服务
cmd /c "taskkill /f /im node.exe"
```

## 技术栈
- 前端：HTML5 + CSS3 + Vanilla JS（SPA，移动端 H5）
- 后端：Node.js + Express
- 数据库：MySQL 8.0（数据库名 exam_system）
- 认证：JWT（密钥在 auth.js）

## 项目结构
```
server/          # 后端 Express 服务
  index.js       # 入口，Express 配置 → :3000
  db.js          # MySQL 连接池 (mysql2/promise)
  auth.js        # JWT 认证中间件 (authMiddleware, teacherOnly)
  init.sql       # 建表 + 初始数据
  routes/        # 路由：user / question / exam / stats
client/          # 前端 SPA
  index.html     # 所有页面 + 模板
  css/style.css  # 移动端样式（max-width:480px）
  js/api.js      # API 封装（Token 管理）
  js/app.js      # APP 全局对象：页面路由 + 业务逻辑
docs/
  论文文档.md    # 课程论文
```

## 关键约定
- API 统一返回 `{ code: 200/400/500, msg, data }`
- 前端 SPA 路由通过 `APP.showPage()` + CSS `.active` 控制显示
- 客观题（单选/多选/判断）提交时自动评分，主观题暂不评分
- 密码使用 bcryptjs 加密，不可逆
- 所有需要登录的接口在 authMiddleware 中验证 Bearer Token

## 测试账号
| 角色 | 用户名 | 密码 |
|------|--------|------|
| 教师 | 通过注册创建 | - |
| 学生 | 通过注册创建 | - |

首次使用需先注册账号，教师账号可管理题库和试卷，学生账号可参加考试。
