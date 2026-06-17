-- 智能在线考试系统 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS exam_system DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exam_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    phone VARCHAR(20) DEFAULT '',
    avatar VARCHAR(255) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 题目分类表
CREATE TABLE IF NOT EXISTS question_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    type ENUM('single', 'multiple', 'judge', 'fill', 'essay') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
    content TEXT NOT NULL,
    options JSON DEFAULT NULL,
    answer TEXT NOT NULL,
    analysis TEXT DEFAULT NULL,
    score DECIMAL(5,2) DEFAULT 5.00,
    teacher_id INT NOT NULL,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES question_categories(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 试卷表
CREATE TABLE IF NOT EXISTS exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    duration INT NOT NULL COMMENT '考试时长(分钟)',
    total_score DECIMAL(7,2) NOT NULL DEFAULT 100.00,
    pass_score DECIMAL(7,2) NOT NULL DEFAULT 60.00,
    start_time DATETIME DEFAULT NULL,
    end_time DATETIME DEFAULT NULL,
    status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
    is_random TINYINT DEFAULT 0 COMMENT '是否随机抽题',
    teacher_id INT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 试卷题目关联表
CREATE TABLE IF NOT EXISTS exam_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 考试记录表
CREATE TABLE IF NOT EXISTS exam_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME DEFAULT NULL,
    submit_time DATETIME DEFAULT NULL,
    score DECIMAL(7,2) DEFAULT NULL,
    is_passed TINYINT DEFAULT NULL,
    status ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'in_progress',
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 答题记录表
CREATE TABLE IF NOT EXISTS exam_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT DEFAULT NULL,
    is_correct TINYINT DEFAULT NULL,
    score DECIMAL(7,2) DEFAULT 0,
    FOREIGN KEY (record_id) REFERENCES exam_records(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认题目分类
INSERT IGNORE INTO question_categories (id, name, description) VALUES
(1, '计算机基础', '计算机基础知识题目'),
(2, '程序设计', '编程语言相关题目'),
(3, '数据库', '数据库相关题目'),
(4, '网络技术', '计算机网络相关题目'),
(5, '操作系统', '操作系统相关题目');

-- 测试账号密码均为 123456 (密码hash需通过服务端注册生成，此处使用占位)
