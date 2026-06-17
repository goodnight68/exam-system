mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: exam_system
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `exam_system`
--

/*!40000 DROP DATABASE IF EXISTS `exam_system`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `exam_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `exam_system`;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `publisher_id` int NOT NULL,
  `is_top` tinyint DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `publisher_id` (`publisher_id`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`publisher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'系统上线通知','智能在线考试系统V2.0已正式上线，支持多题型在线考试、自动评分、错题本等功能。',1,1,'2026-06-16 21:20:35'),(2,'期末考试安排','本学期期末考试将于第18周进行，请各位同学提前做好复习准备。',2,2,'2026-06-16 21:20:35'),(3,'题库更新公告','新增程序设计、网络技术等80余道题库，覆盖7大知识领域。',3,0,'2026-06-16 21:20:35');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_answers`
--

DROP TABLE IF EXISTS `exam_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer` text,
  `is_correct` tinyint DEFAULT NULL,
  `score` decimal(7,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `record_id` (`record_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `exam_records` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_answers`
--

LOCK TABLES `exam_answers` WRITE;
/*!40000 ALTER TABLE `exam_answers` DISABLE KEYS */;
INSERT INTO `exam_answers` VALUES (1,1,1,'C',0,0.00),(2,1,2,'',NULL,0.00),(3,1,3,'',NULL,0.00),(4,1,7,'',NULL,0.00),(5,1,9,'',NULL,0.00),(6,1,10,'',NULL,0.00),(7,1,30,'',NULL,0.00),(8,1,31,'',NULL,0.00),(9,1,32,'',NULL,0.00),(10,1,33,'',NULL,0.00),(11,1,49,'',NULL,0.00),(12,1,50,'',NULL,0.00),(13,2,25,'C',0,0.00),(14,2,26,'C',0,0.00),(15,2,27,'B',0,0.00),(16,2,28,'C',0,0.00),(17,2,29,'B',0,0.00),(18,2,31,'C',1,5.00),(19,2,32,'C',0,0.00),(20,2,34,'D',0,0.00),(21,2,35,'B',0,0.00),(22,2,36,'666666666',1,8.00),(23,3,25,'',NULL,0.00),(24,3,26,'',NULL,0.00),(25,3,27,'',NULL,0.00),(26,3,28,'',NULL,0.00),(27,3,29,'',NULL,0.00),(28,3,31,'',NULL,0.00),(29,3,32,'',NULL,0.00),(30,3,34,'',NULL,0.00),(31,3,35,'',NULL,0.00),(32,3,36,'',NULL,0.00);
/*!40000 ALTER TABLE `exam_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_questions`
--

DROP TABLE IF EXISTS `exam_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `question_id` int NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_questions`
--

LOCK TABLES `exam_questions` WRITE;
/*!40000 ALTER TABLE `exam_questions` DISABLE KEYS */;
INSERT INTO `exam_questions` VALUES (1,1,1,1),(2,1,2,2),(3,1,3,3),(4,1,7,4),(5,1,9,5),(6,1,10,6),(7,1,30,7),(8,1,31,8),(9,1,32,9),(10,1,33,10),(11,1,49,11),(12,1,50,12),(13,2,25,1),(14,2,26,2),(15,2,27,3),(16,2,28,4),(17,2,29,5),(18,2,31,6),(19,2,32,7),(20,2,34,8),(21,2,35,9),(22,2,36,10),(23,3,39,1),(24,3,40,2),(25,3,41,3),(26,3,42,4),(27,3,43,5),(28,3,44,6),(29,3,45,7),(30,3,46,8),(31,3,47,9),(32,3,48,10),(33,3,51,11),(34,3,52,12),(35,4,13,1),(36,4,14,2),(37,4,17,3),(38,4,19,4),(39,4,22,5),(40,4,23,6),(41,4,24,7),(42,4,55,8),(43,4,56,9),(44,4,57,10),(45,4,65,11),(46,4,66,12),(47,4,67,13),(48,4,68,14),(49,4,71,15),(50,5,83,1),(51,5,84,2),(52,5,85,3),(53,5,86,4),(54,5,87,5),(55,5,88,6),(56,5,89,7),(57,5,90,8),(58,5,93,9),(59,5,94,10),(60,5,97,11),(61,5,98,12),(62,5,99,13),(63,5,101,14),(64,5,103,15);
/*!40000 ALTER TABLE `exam_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_records`
--

DROP TABLE IF EXISTS `exam_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `submit_time` datetime DEFAULT NULL,
  `score` decimal(7,2) DEFAULT NULL,
  `is_passed` tinyint DEFAULT NULL,
  `status` enum('in_progress','submitted','graded') NOT NULL DEFAULT 'in_progress',
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `exam_records_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
  CONSTRAINT `exam_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_records`
--

LOCK TABLES `exam_records` WRITE;
/*!40000 ALTER TABLE `exam_records` DISABLE KEYS */;
INSERT INTO `exam_records` VALUES (1,1,4,'2026-06-16 21:21:40','2026-06-16 22:21:40','2026-06-16 21:21:46',0.00,0,'graded'),(2,2,4,'2026-06-16 21:22:33','2026-06-16 22:07:33','2026-06-16 21:22:53',13.00,0,'graded'),(3,2,4,'2026-06-16 21:23:36','2026-06-16 22:08:36','2026-06-16 21:23:39',0.00,0,'graded');
/*!40000 ALTER TABLE `exam_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_templates`
--

DROP TABLE IF EXISTS `exam_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `config` json NOT NULL,
  `teacher_id` int NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `exam_templates_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_templates`
--

LOCK TABLES `exam_templates` WRITE;
/*!40000 ALTER TABLE `exam_templates` DISABLE KEYS */;
INSERT INTO `exam_templates` VALUES (1,'标准期末模板','10单选+5多选+5判断+2简答','{\"essay\": 2, \"judge\": 5, \"total\": 100, \"single\": 10, \"multiple\": 5}',1,'2026-06-16 21:20:35'),(2,'随堂测验模板','5单选+3判断','{\"judge\": 3, \"total\": 40, \"single\": 5}',1,'2026-06-16 21:20:35');
/*!40000 ALTER TABLE `exam_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `duration` int NOT NULL,
  `total_score` decimal(7,2) NOT NULL DEFAULT '100.00',
  `pass_score` decimal(7,2) NOT NULL DEFAULT '60.00',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `is_random` tinyint DEFAULT '0',
  `teacher_id` int NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (1,'计算机基础综合测试','计算机组成+数据表示+操作系统基础',60,62.00,60.00,NULL,NULL,'published',0,1,'2026-06-16 21:20:35'),(2,'数据库与SQL专项','关系数据库、SQL语法与事务',45,55.00,50.00,NULL,NULL,'published',0,2,'2026-06-16 21:20:35'),(3,'网络技术与安全','OSI模型、TCP/IP、网络安全',50,63.00,55.00,NULL,NULL,'published',0,2,'2026-06-16 21:20:35'),(4,'软件开发综合','程序设计+Web前端+软件工程',60,82.00,60.00,NULL,NULL,'published',0,3,'2026-06-16 21:20:35'),(5,'综合能力测试','Python+Linux+前端+云计算，考察广度',45,77.00,50.00,NULL,NULL,'published',0,3,'2026-06-16 21:20:35');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_points`
--

DROP TABLE IF EXISTS `knowledge_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `subject` varchar(50) DEFAULT '',
  `description` text,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_points`
--

LOCK TABLES `knowledge_points` WRITE;
/*!40000 ALTER TABLE `knowledge_points` DISABLE KEYS */;
INSERT INTO `knowledge_points` VALUES (1,'计算机组成原理','计算机基础',NULL,'2026-06-16 21:20:34'),(2,'数据表示与运算','计算机基础',NULL,'2026-06-16 21:20:34'),(3,'操作系统概述','操作系统',NULL,'2026-06-16 21:20:34'),(4,'进程管理','操作系统',NULL,'2026-06-16 21:20:34'),(5,'内存管理','操作系统',NULL,'2026-06-16 21:20:34'),(6,'文件系统','操作系统',NULL,'2026-06-16 21:20:34'),(7,'网络体系结构','网络技术',NULL,'2026-06-16 21:20:34'),(8,'TCP/IP协议','网络技术',NULL,'2026-06-16 21:20:34'),(9,'应用层协议','网络技术',NULL,'2026-06-16 21:20:34'),(10,'网络安全','网络技术',NULL,'2026-06-16 21:20:34'),(11,'关系数据库','数据库技术',NULL,'2026-06-16 21:20:34'),(12,'SQL语言','数据库技术',NULL,'2026-06-16 21:20:34'),(13,'事务与并发','数据库技术',NULL,'2026-06-16 21:20:34'),(14,'数据库设计','数据库技术',NULL,'2026-06-16 21:20:34'),(15,'面向对象编程','程序设计',NULL,'2026-06-16 21:20:35'),(16,'数据结构','程序设计',NULL,'2026-06-16 21:20:35'),(17,'算法分析','程序设计',NULL,'2026-06-16 21:20:35'),(18,'设计模式','程序设计',NULL,'2026-06-16 21:20:35'),(19,'HTML/CSS基础','Web前端',NULL,'2026-06-16 21:20:35'),(20,'JavaScript核心','Web前端',NULL,'2026-06-16 21:20:35'),(21,'前端框架','Web前端',NULL,'2026-06-16 21:20:35'),(22,'软件生命周期','软件工程',NULL,'2026-06-16 21:20:35'),(23,'需求分析','软件工程',NULL,'2026-06-16 21:20:35'),(24,'软件测试','软件工程',NULL,'2026-06-16 21:20:35'),(25,'项目管理','软件工程',NULL,'2026-06-16 21:20:35');
/*!40000 ALTER TABLE `knowledge_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_categories`
--

DROP TABLE IF EXISTS `question_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT '',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_categories`
--

LOCK TABLES `question_categories` WRITE;
/*!40000 ALTER TABLE `question_categories` DISABLE KEYS */;
INSERT INTO `question_categories` VALUES (1,'计算机基础','计算机导论与组成原理','2026-06-16 21:20:35'),(2,'程序设计','编程语言、算法与数据结构','2026-06-16 21:20:35'),(3,'数据库技术','SQL、关系数据库与NoSQL','2026-06-16 21:20:35'),(4,'网络技术','计算机网络与通信协议','2026-06-16 21:20:35'),(5,'操作系统','OS原理与应用','2026-06-16 21:20:35'),(6,'Web前端','HTML/CSS/JavaScript/框架','2026-06-16 21:20:35'),(7,'软件工程','开发过程、测试与项目管理','2026-06-16 21:20:35');
/*!40000 ALTER TABLE `question_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `kp_id` int DEFAULT NULL,
  `type` enum('single','multiple','judge','fill','essay') NOT NULL,
  `difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
  `content` text NOT NULL,
  `image` varchar(500) DEFAULT '',
  `options` json DEFAULT NULL,
  `answer` text NOT NULL,
  `analysis` text,
  `score` decimal(5,2) DEFAULT '5.00',
  `teacher_id` int NOT NULL,
  `status` tinyint DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `kp_id` (`kp_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `question_categories` (`id`),
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`kp_id`) REFERENCES `knowledge_points` (`id`),
  CONSTRAINT `questions_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,1,'single','easy','计算机中数据的最小单位是？','','\"[\\\"A. 位(bit)\\\",\\\"B. 字节(Byte)\\\",\\\"C. 字(Word)\\\",\\\"D. 千字节(KB)\\\"]\"','A','bit是二进制位，是最小数据单位。',5.00,1,1,'2026-06-16 21:20:35'),(2,1,2,'single','easy','1KB等于多少字节？','','\"[\\\"A. 100\\\",\\\"B. 512\\\",\\\"C. 1000\\\",\\\"D. 1024\\\"]\"','D','1KB=2^10=1024B。',5.00,1,1,'2026-06-16 21:20:35'),(3,1,1,'single','easy','CPU的中文名称是？','','\"[\\\"A. 内存\\\",\\\"B. 中央处理器\\\",\\\"C. 硬盘\\\",\\\"D. 显卡\\\"]\"','B','CPU=Central Processing Unit。',5.00,1,1,'2026-06-16 21:20:35'),(4,1,1,'judge','easy','RAM中存储的数据在断电后会丢失。','',NULL,'true','RAM是易失性存储器。',5.00,1,1,'2026-06-16 21:20:35'),(5,1,1,'multiple','medium','以下属于输入设备的有？','','\"[\\\"A. 键盘\\\",\\\"B. 鼠标\\\",\\\"C. 显示器\\\",\\\"D. 扫描仪\\\",\\\"E. 打印机\\\"]\"','ABD','显示器/打印机是输出设备。',6.00,1,1,'2026-06-16 21:20:35'),(6,1,1,'single','medium','冯·诺依曼体系结构中不包括？','','\"[\\\"A. 运算器\\\",\\\"B. 控制器\\\",\\\"C. 存储器\\\",\\\"D. 图形处理器\\\"]\"','D','GPU不在冯·诺依曼五部件中。',5.00,1,1,'2026-06-16 21:20:35'),(7,1,1,'judge','medium','固态硬盘(SSD)比机械硬盘(HDD)读写速度更快。','',NULL,'true','SSD无机械部件，延迟低。',5.00,1,1,'2026-06-16 21:20:35'),(8,1,1,'single','medium','以下哪种存储器存取速度最快？','','\"[\\\"A. 硬盘\\\",\\\"B. 内存\\\",\\\"C. CPU缓存\\\",\\\"D. USB闪存\\\"]\"','C','速度: 寄存器>L1缓存>L2缓存>内存>硬盘。',5.00,1,1,'2026-06-16 21:20:35'),(9,1,2,'single','easy','二进制数1010对应的十进制是？','','\"[\\\"A. 8\\\",\\\"B. 10\\\",\\\"C. 12\\\",\\\"D. 14\\\"]\"','B','1×2³+0×2²+1×2¹+0×2⁰=10。',5.00,1,1,'2026-06-16 21:20:35'),(10,1,2,'judge','easy','在计算机中，所有数据最终都以二进制形式存储。','',NULL,'true','计算机采用二进制系统。',5.00,1,1,'2026-06-16 21:20:35'),(11,1,1,'fill','medium','计算机执行指令的过程分为____、____和执行三个阶段。','',NULL,'取指,译码','指令周期：取指→译码→执行。',6.00,1,1,'2026-06-16 21:20:35'),(12,1,2,'multiple','hard','以下关于补码的说法正确的有？','','\"[\\\"A. 正数的补码是其本身\\\",\\\"B. 零的补码表示唯一\\\",\\\"C. 补码能简化减法运算\\\",\\\"D. 补码和原码完全相同\\\"]\"','ABC','补码解决了符号运算和双零问题。',6.00,1,1,'2026-06-16 21:20:35'),(13,2,15,'single','easy','Java中定义常量的关键字是？','','\"[\\\"A. const\\\",\\\"B. final\\\",\\\"C. static\\\",\\\"D. define\\\"]\"','B','final定义常量，const是保留字。',5.00,1,1,'2026-06-16 21:20:35'),(14,2,15,'single','medium','以下哪个不是面向对象的特性？','','\"[\\\"A. 封装\\\",\\\"B. 继承\\\",\\\"C. 多态\\\",\\\"D. 编译\\\"]\"','D','OOP三大特性：封装、继承、多态。',5.00,1,1,'2026-06-16 21:20:35'),(15,2,15,'multiple','medium','以下哪些属于Java基本数据类型？','','\"[\\\"A. int\\\",\\\"B. String\\\",\\\"C. boolean\\\",\\\"D. double\\\",\\\"E. Array\\\"]\"','ACD','String和Array是引用类型。',6.00,1,1,'2026-06-16 21:20:35'),(16,2,16,'single','medium','冒泡排序的时间复杂度是？','','\"[\\\"A. O(n)\\\",\\\"B. O(n log n)\\\",\\\"C. O(n²)\\\",\\\"D. O(1)\\\"]\"','C','冒泡排序平均O(n²)。',5.00,1,1,'2026-06-16 21:20:35'),(17,2,15,'judge','easy','Python是解释型语言。','',NULL,'true','Python逐行解释执行。',5.00,1,1,'2026-06-16 21:20:35'),(18,2,17,'single','medium','二分查找的前提条件是？','','\"[\\\"A. 数据有序\\\",\\\"B. 数据无序\\\",\\\"C. 链表存储\\\",\\\"D. 数据量大\\\"]\"','A','二分查找要求数据有序排列。',5.00,1,1,'2026-06-16 21:20:35'),(19,2,18,'single','hard','单例模式保证类有几个实例？','','\"[\\\"A. 0个\\\",\\\"B. 1个\\\",\\\"C. 多个\\\",\\\"D. 不限\\\"]\"','B','Singleton确保唯一实例。',5.00,1,1,'2026-06-16 21:20:35'),(20,2,16,'single','medium','栈的特点是？','','\"[\\\"A. FIFO\\\",\\\"B. LIFO\\\",\\\"C. 随机存取\\\",\\\"D. 按索引存取\\\"]\"','B','栈(Stack)后进先出(LIFO)。',5.00,1,1,'2026-06-16 21:20:35'),(21,2,16,'multiple','medium','以下哪些是树结构的遍历方式？','','\"[\\\"A. 前序遍历\\\",\\\"B. 中序遍历\\\",\\\"C. 后序遍历\\\",\\\"D. 层序遍历\\\",\\\"E. 散序遍历\\\"]\"','ABCD','树的四种基本遍历。',6.00,1,1,'2026-06-16 21:20:35'),(22,2,15,'fill','medium','面向对象中，____是指子类可以替换父类出现在任何地方。','',NULL,'里氏替换原则','LSP是SOLID原则之一。',6.00,1,1,'2026-06-16 21:20:35'),(23,2,17,'judge','hard','动态规划算法总是比贪心算法得到更优解。','',NULL,'false','贪心算法在特定问题下最优（如最小生成树）。',5.00,1,1,'2026-06-16 21:20:35'),(24,2,15,'essay','hard','简述面向对象编程中继承与组合的区别及使用场景。','',NULL,'继承(is-a)：子类继承父类属性和方法，强耦合。组合(has-a)：类包含其他类实例，低耦合。优先使用组合而非继承。','组合优于继承是重要设计原则。',8.00,1,1,'2026-06-16 21:20:35'),(25,3,11,'single','easy','SQL中查询所有列的符号是？','','\"[\\\"A. #\\\",\\\"B. *\\\",\\\"C. &\\\",\\\"D. @\\\"]\"','B','SELECT * 查询所有列。',5.00,2,1,'2026-06-16 21:20:35'),(26,3,11,'single','medium','MongoDB属于什么类型的数据库？','','\"[\\\"A. 关系型\\\",\\\"B. 文档型\\\",\\\"C. 图数据库\\\",\\\"D. 键值型\\\"]\"','B','MongoDB是NoSQL文档数据库。',5.00,2,1,'2026-06-16 21:20:35'),(27,3,12,'multiple','medium','SQL中常用的聚合函数有？','','\"[\\\"A. COUNT\\\",\\\"B. SUM\\\",\\\"C. AVG\\\",\\\"D. LENGTH\\\",\\\"E. MAX\\\"]\"','ABCE','COUNT/SUM/AVG/MAX/MIN是聚合函数。',6.00,2,1,'2026-06-16 21:20:35'),(28,3,12,'single','medium','去重查询使用的关键字是？','','\"[\\\"A. UNIQUE\\\",\\\"B. DISTINCT\\\",\\\"C. DIFFERENT\\\",\\\"D. GROUP\\\"]\"','B','SELECT DISTINCT去重。',5.00,2,1,'2026-06-16 21:20:35'),(29,3,11,'judge','easy','主键可以包含NULL值。','',NULL,'false','主键非空且唯一（实体完整性）。',5.00,2,1,'2026-06-16 21:20:35'),(30,3,13,'fill','medium','MySQL中支持事务的存储引擎是____。','',NULL,'InnoDB','InnoDB支持ACID事务，MyISAM不支持。',6.00,2,1,'2026-06-16 21:20:35'),(31,3,12,'single','medium','删除整个表结构的SQL命令是？','','\"[\\\"A. DELETE\\\",\\\"B. TRUNCATE\\\",\\\"C. DROP TABLE\\\",\\\"D. REMOVE\\\"]\"','C','DROP删除表结构+数据。',5.00,2,1,'2026-06-16 21:20:35'),(32,3,14,'single','medium','数据库设计范式化主要目的是？','','\"[\\\"A. 提高查询速度\\\",\\\"B. 减少数据冗余\\\",\\\"C. 增加表数量\\\",\\\"D. 简化SQL\\\"]\"','B','范式化减少数据冗余和更新异常。',5.00,2,1,'2026-06-16 21:20:35'),(33,3,13,'single','hard','事务的隔离级别中，最高级别是？','','\"[\\\"A. READ UNCOMMITTED\\\",\\\"B. READ COMMITTED\\\",\\\"C. REPEATABLE READ\\\",\\\"D. SERIALIZABLE\\\"]\"','D','Serializable最高，完全串行执行。',5.00,2,1,'2026-06-16 21:20:35'),(34,3,12,'multiple','medium','以下关于索引说法正确的有？','','\"[\\\"A. 加速查询\\\",\\\"B. 减慢写入\\\",\\\"C. 占用存储空间\\\",\\\"D. 越多越好\\\",\\\"E. 主键自动创建索引\\\"]\"','ABCE','索引不是越多越好，需权衡。',6.00,2,1,'2026-06-16 21:20:35'),(35,3,11,'judge','medium','MySQL中，InnoDB支持外键约束。','',NULL,'true','InnoDB支持外键，MyISAM不支持。',5.00,2,1,'2026-06-16 21:20:35'),(36,3,13,'essay','hard','简述数据库事务的ACID特性。','',NULL,'原子性(Atomicity)：事务不可分割。一致性(Consistency)：前后数据一致。隔离性(Isolation)：并发互不干扰。持久性(Durability)：提交后永久保存。','ACID是事务核心。',8.00,2,1,'2026-06-16 21:20:35'),(37,3,12,'single','easy','LIMIT 5,10 表示？','','\"[\\\"A. 取前5条\\\",\\\"B. 跳过5条取10条\\\",\\\"C. 取第5到10条\\\",\\\"D. 取后10条\\\"]\"','B','LIMIT offset, count。',5.00,2,1,'2026-06-16 21:20:35'),(38,3,12,'fill','medium','在MySQL中，____命令用于创建新的数据库。','',NULL,'CREATE DATABASE','DDL语句。',6.00,2,1,'2026-06-16 21:20:35'),(39,4,7,'single','easy','HTTP协议默认端口是？','','\"[\\\"A. 21\\\",\\\"B. 25\\\",\\\"C. 80\\\",\\\"D. 443\\\"]\"','C','HTTP:80, HTTPS:443。',5.00,2,1,'2026-06-16 21:20:35'),(40,4,7,'single','medium','OSI模型中传输层是第几层？','','\"[\\\"A. 第2层\\\",\\\"B. 第3层\\\",\\\"C. 第4层\\\",\\\"D. 第5层\\\"]\"','C','物理1→链路2→网络3→传输4→会话5→表示6→应用7。',5.00,2,1,'2026-06-16 21:20:35'),(41,4,8,'multiple','medium','TCP协议的特点包括？','','\"[\\\"A. 面向连接\\\",\\\"B. 可靠传输\\\",\\\"C. 流量控制\\\",\\\"D. 拥塞控制\\\",\\\"E. 速度比UDP快\\\"]\"','ABCD','UDP速度快但不可靠。',6.00,2,1,'2026-06-16 21:20:35'),(42,4,7,'single','easy','192.168.1.1属于哪类地址？','','\"[\\\"A. A类\\\",\\\"B. B类\\\",\\\"C. C类\\\",\\\"D. D类\\\"]\"','C','C类:192.0.0.0-223.255.255.255。',5.00,2,1,'2026-06-16 21:20:35'),(43,4,9,'judge','medium','DNS将域名解析为IP地址。','',NULL,'true','DNS=Domain Name System。',5.00,2,1,'2026-06-16 21:20:35'),(44,4,8,'single','medium','TCP三次握手，客户端首先发送？','','\"[\\\"A. ACK\\\",\\\"B. SYN\\\",\\\"C. SYN+ACK\\\",\\\"D. FIN\\\"]\"','B','客户端SYN→服务端SYN+ACK→客户端ACK。',5.00,2,1,'2026-06-16 21:20:35'),(45,4,9,'fill','medium','HTTP状态码404表示____。','',NULL,'资源未找到','404 Not Found。',6.00,2,1,'2026-06-16 21:20:35'),(46,4,10,'single','medium','以下哪项是安全的文件传输协议？','','\"[\\\"A. FTP\\\",\\\"B. Telnet\\\",\\\"C. SFTP\\\",\\\"D. HTTP\\\"]\"','C','SFTP基于SSH加密传输。',5.00,2,1,'2026-06-16 21:20:35'),(47,4,8,'single','medium','IP地址127.0.0.1代表？','','\"[\\\"A. 广播地址\\\",\\\"B. 本地回环地址\\\",\\\"C. 网络地址\\\",\\\"D. 网关地址\\\"]\"','B','127.0.0.1=localhost。',5.00,2,1,'2026-06-16 21:20:35'),(48,4,9,'judge','easy','HTTPS使用SSL/TLS进行加密传输。','',NULL,'true','HTTPS=HTTP over SSL/TLS。',5.00,2,1,'2026-06-16 21:20:35'),(49,4,7,'multiple','hard','以下关于IPv6说法正确的有？','','\"[\\\"A. 128位地址\\\",\\\"B. 地址空间更大\\\",\\\"C. 内置IPSec\\\",\\\"D. 与IPv4完全兼容\\\",\\\"E. 简化了头部格式\\\"]\"','ABCE','IPv6与IPv4不兼容，需过渡技术。',6.00,2,1,'2026-06-16 21:20:35'),(50,4,8,'single','hard','TCP拥塞控制中，慢启动阶段拥塞窗口如何增长？','','\"[\\\"A. 线性增长\\\",\\\"B. 指数增长\\\",\\\"C. 保持不变\\\",\\\"D. 随机变化\\\"]\"','B','慢启动阶段CWND指数增长直到阈值。',5.00,2,1,'2026-06-16 21:20:35'),(51,4,10,'single','medium','SQL注入攻击属于哪类安全威胁？','','\"[\\\"A. DDoS\\\",\\\"B. Web应用攻击\\\",\\\"C. 病毒攻击\\\",\\\"D. 物理攻击\\\"]\"','B','SQL注入是针对Web应用的注入攻击。',5.00,2,1,'2026-06-16 21:20:35'),(52,4,9,'fill','medium','HTTP请求方法中，____用于向服务器提交数据。','',NULL,'POST','GET获取资源，POST提交数据。',6.00,2,1,'2026-06-16 21:20:35'),(53,5,3,'single','easy','以下哪个不是操作系统？','','\"[\\\"A. Windows\\\",\\\"B. Linux\\\",\\\"C. MySQL\\\",\\\"D. macOS\\\"]\"','C','MySQL是DBMS。',5.00,3,1,'2026-06-16 21:20:35'),(54,5,4,'single','medium','关于进程和线程，正确的是？','','\"[\\\"A. 进程是资源分配最小单位\\\",\\\"B. 线程不能共享进程资源\\\",\\\"C. 进程切换开销小于线程\\\",\\\"D. 一个进程只有一个线程\\\"]\"','A','线程是调度单位。',5.00,3,1,'2026-06-16 21:20:35'),(55,5,4,'multiple','medium','常见的进程调度算法有？','','\"[\\\"A. FCFS\\\",\\\"B. SJF\\\",\\\"C. 冒泡排序\\\",\\\"D. 时间片轮转\\\",\\\"E. 多级反馈队列\\\"]\"','ABDE','冒泡排序是排序算法。',6.00,3,1,'2026-06-16 21:20:35'),(56,5,4,'judge','easy','死锁四个必要条件：互斥、保持等待、不可剥夺、循环等待。','',NULL,'true','这是死锁充要条件。',5.00,3,1,'2026-06-16 21:20:35'),(57,5,5,'fill','medium','操作系统通过____技术实现虚拟内存。','',NULL,'分页/页面置换','虚拟内存=物理内存+磁盘空间映射。',6.00,3,1,'2026-06-16 21:20:35'),(58,5,5,'single','hard','段页式存储管理中访问数据需几次访存？','','\"[\\\"A. 1次\\\",\\\"B. 2次\\\",\\\"C. 3次\\\",\\\"D. 4次\\\"]\"','C','段表→页表→数据(TLB可减少)。',5.00,3,1,'2026-06-16 21:20:35'),(59,5,6,'single','easy','Linux中文件权限rwx分别代表？','','\"[\\\"A. 读/写/执行\\\",\\\"B. 复制/写/执行\\\",\\\"C. 读/等待/扩展\\\",\\\"D. 移除/写/执行\\\"]\"','A','r=read,w=write,x=execute。',5.00,3,1,'2026-06-16 21:20:35'),(60,5,3,'judge','easy','Windows是单用户多任务操作系统。','',NULL,'false','Windows是多用户多任务操作系统。',5.00,3,1,'2026-06-16 21:20:35'),(61,5,5,'single','medium','页面置换算法中，OPT是什么意思？','','\"[\\\"A. 最近最久未使用\\\",\\\"B. 先进先出\\\",\\\"C. 最佳置换\\\",\\\"D. 时钟算法\\\"]\"','C','OPT=Optimal，理论上最优但无法实现。',5.00,3,1,'2026-06-16 21:20:35'),(62,5,4,'multiple','medium','以下哪些是进程间通信方式？','','\"[\\\"A. 管道\\\",\\\"B. 消息队列\\\",\\\"C. 共享内存\\\",\\\"D. 信号量\\\",\\\"E. Socket\\\"]\"','ABCDE','都是IPC常用方式。',6.00,3,1,'2026-06-16 21:20:35'),(63,5,6,'single','medium','在Linux中查看当前进程的命令是？','','\"[\\\"A. dir\\\",\\\"B. ps\\\",\\\"C. ls\\\",\\\"D. cd\\\"]\"','B','ps(process status)查看进程。',5.00,3,1,'2026-06-16 21:20:35'),(64,5,5,'essay','hard','简述虚拟内存的优点。','',NULL,'1.扩展可用内存空间 2.实现进程隔离 3.支持更多并发进程 4.简化内存管理','虚拟内存是现代OS核心机制。',8.00,3,1,'2026-06-16 21:20:35'),(65,6,19,'single','easy','HTML中创建超链接的标签是？','','\"[\\\"A. <link>\\\",\\\"B. <a>\\\",\\\"C. <href>\\\",\\\"D. <url>\\\"]\"','B','<a href=\"url\">链接</a>。',5.00,3,1,'2026-06-16 21:20:35'),(66,6,19,'multiple','medium','以下哪些是CSS选择器？','','\"[\\\"A. .class\\\",\\\"B. #id\\\",\\\"C. @func\\\",\\\"D. div\\\",\\\"E. [attr]\\\"]\"','ABDE','@func不是CSS选择器。',6.00,3,1,'2026-06-16 21:20:35'),(67,6,20,'judge','medium','let声明的变量具有块级作用域。','',NULL,'true','let/const块级作用域，var函数作用域。',5.00,3,1,'2026-06-16 21:20:35'),(68,6,20,'single','medium','JavaScript中typeof null的结果是？','','\"[\\\"A. null\\\",\\\"B. undefined\\\",\\\"C. object\\\",\\\"D. boolean\\\"]\"','C','这是JS的历史遗留bug。',5.00,3,1,'2026-06-16 21:20:35'),(69,6,19,'single','easy','CSS中设置背景颜色的属性是？','','\"[\\\"A. color\\\",\\\"B. bgcolor\\\",\\\"C. background-color\\\",\\\"D. bg\\\"]\"','C','background-color设置背景色。',5.00,3,1,'2026-06-16 21:20:35'),(70,6,20,'multiple','medium','Promise的状态包括？','','\"[\\\"A. pending\\\",\\\"B. fulfilled\\\",\\\"C. rejected\\\",\\\"D. completed\\\",\\\"E. running\\\"]\"','ABC','Promise三态：pending/fulfilled/rejected。',6.00,3,1,'2026-06-16 21:20:35'),(71,6,21,'single','medium','Vue.js中用于数据双向绑定的指令是？','','\"[\\\"A. v-bind\\\",\\\"B. v-if\\\",\\\"C. v-model\\\",\\\"D. v-for\\\"]\"','C','v-model实现表单双向绑定。',5.00,3,1,'2026-06-16 21:20:35'),(72,6,20,'fill','medium','在JavaScript中，____函数用于将JSON字符串转换为对象。','',NULL,'JSON.parse','JSON.parse(str)解析JSON。',6.00,3,1,'2026-06-16 21:20:35'),(73,7,22,'single','medium','UML是什么的缩写？','','\"[\\\"A. 统一建模语言\\\",\\\"B. 通用标记语言\\\",\\\"C. 用户界面语言\\\",\\\"D. 单元测试库\\\"]\"','A','UML=Unified Modeling Language。',5.00,3,1,'2026-06-16 21:20:35'),(74,7,24,'multiple','medium','软件测试层次包括？','','\"[\\\"A. 单元测试\\\",\\\"B. 集成测试\\\",\\\"C. 系统测试\\\",\\\"D. 验收测试\\\",\\\"E. 编译测试\\\"]\"','ABCD','编译不属于测试层次。',6.00,3,1,'2026-06-16 21:20:35'),(75,7,22,'single','easy','敏捷开发中最常用的框架是？','','\"[\\\"A. Waterfall\\\",\\\"B. Scrum\\\",\\\"C. CMMI\\\",\\\"D. RUP\\\"]\"','B','Scrum是最流行的敏捷框架。',5.00,3,1,'2026-06-16 21:20:35'),(76,7,25,'judge','easy','甘特图是用于项目进度管理的工具。','',NULL,'true','Gantt Chart直观展示任务时间线。',5.00,3,1,'2026-06-16 21:20:35'),(77,7,23,'single','medium','软件需求分析阶段的主要产出是？','','\"[\\\"A. 代码\\\",\\\"B. 需求规格说明书\\\",\\\"C. 测试报告\\\",\\\"D. 部署文档\\\"]\"','B','SRS(Software Requirements Specification)。',5.00,3,1,'2026-06-16 21:20:35'),(78,7,22,'multiple','medium','以下哪些属于软件开发模型？','','\"[\\\"A. 瀑布模型\\\",\\\"B. 螺旋模型\\\",\\\"C. V模型\\\",\\\"D. 敏捷模型\\\",\\\"E. 星型模型\\\"]\"','ABCD','星型模型不是开发模型。',6.00,3,1,'2026-06-16 21:20:35'),(79,7,24,'single','medium','黑盒测试不关心什么？','','\"[\\\"A. 输入\\\",\\\"B. 输出\\\",\\\"C. 功能\\\",\\\"D. 内部代码结构\\\"]\"','D','黑盒测试不关心内部实现。',5.00,3,1,'2026-06-16 21:20:35'),(80,7,25,'fill','medium','软件开发中，____是指按照计划控制项目范围、时间和成本的过程。','',NULL,'项目管理','Project Management是项目成功的关键。',6.00,3,1,'2026-06-16 21:20:35'),(81,1,1,'single','medium','主板上的BIOS芯片属于什么存储器？','','\"[\\\"A. RAM\\\",\\\"B. ROM\\\",\\\"C. Cache\\\",\\\"D. SSD\\\"]\"','B','BIOS存储在ROM(只读存储器)中。',5.00,1,1,'2026-06-16 21:20:35'),(82,1,1,'fill','easy','计算机的核心部件____负责执行算术和逻辑运算。','',NULL,'ALU/运算器','ALU=Arithmetic Logic Unit。',6.00,1,1,'2026-06-16 21:20:35'),(83,2,15,'single','easy','Python中定义函数的关鍵字是？','','\"[\\\"A. func\\\",\\\"B. def\\\",\\\"C. function\\\",\\\"D. define\\\"]\"','B','Python使用def关键字定义函数。',5.00,1,1,'2026-06-16 21:20:35'),(84,2,15,'single','medium','Python中列表(list)和元组(tuple)的主要区别是？','','\"[\\\"A. 列表有序元组无序\\\",\\\"B. 列表可变元组不可变\\\",\\\"C. 列表可包含不同类型\\\",\\\"D. 元组不能索引\\\"]\"','B','元组是不可变的，列表是可变的。',5.00,1,1,'2026-06-16 21:20:35'),(85,2,16,'single','easy','队列的特点是？','','\"[\\\"A. FIFO\\\",\\\"B. LIFO\\\",\\\"C. 随机存取\\\",\\\"D. 按键存取\\\"]\"','A','队列先进先出(FIFO=First In First Out)。',5.00,1,1,'2026-06-16 21:20:35'),(86,2,17,'single','medium','快速排序的平均时间复杂度是？','','\"[\\\"A. O(n)\\\",\\\"B. O(n log n)\\\",\\\"C. O(n²)\\\",\\\"D. O(log n)\\\"]\"','B','快排平均O(n log n)，最坏O(n²)。',5.00,1,1,'2026-06-16 21:20:35'),(87,2,18,'single','medium','观察者模式属于哪类设计模式？','','\"[\\\"A. 创建型\\\",\\\"B. 结构型\\\",\\\"C. 行为型\\\",\\\"D. 混合型\\\"]\"','C','观察者模式是行为型设计模式。',5.00,1,1,'2026-06-16 21:20:35'),(88,2,15,'judge','easy','Python中缩进是语法的一部分。','',NULL,'true','Python用缩进表示代码块，不用大括号。',5.00,1,1,'2026-06-16 21:20:35'),(89,3,11,'single','easy','关系数据库中，表与表之间的关联通过什么实现？','','\"[\\\"A. 主键\\\",\\\"B. 外键\\\",\\\"C. 索引\\\",\\\"D. 视图\\\"]\"','B','外键建立表之间的参照关系。',5.00,2,1,'2026-06-16 21:20:35'),(90,3,12,'single','easy','以下哪个不是SQL中的约束？','','\"[\\\"A. PRIMARY KEY\\\",\\\"B. UNIQUE\\\",\\\"C. NOT NULL\\\",\\\"D. GROUP BY\\\"]\"','D','GROUP BY是查询子句不是约束。',5.00,2,1,'2026-06-16 21:20:35'),(91,3,12,'fill','easy','SQL语句中，____关键字用于对查询结果进行排序。','',NULL,'ORDER BY','默认升序ASC，降序DESC。',6.00,2,1,'2026-06-16 21:20:35'),(92,3,14,'single','medium','ER图中，实体之间的关系不包括？','','\"[\\\"A. 一对一\\\",\\\"B. 一对多\\\",\\\"C. 多对多\\\",\\\"D. 循环\\\"]\"','D','ER关系只有1:1、1:N、M:N三种。',5.00,2,1,'2026-06-16 21:20:35'),(93,4,8,'single','easy','TCP/IP模型中，传输层对应OSI的哪一层？','','\"[\\\"A. 网络层\\\",\\\"B. 传输层\\\",\\\"C. 会话层\\\",\\\"D. 应用层\\\"]\"','B','TCP/IP传输层对应OSI传输层。',5.00,2,1,'2026-06-16 21:20:35'),(94,4,8,'fill','easy','IP地址由____位二进制组成（IPv4）。','',NULL,'32','IPv4为32位，分4段每段8位。',6.00,2,1,'2026-06-16 21:20:35'),(95,4,9,'single','easy','浏览器中输入网址后，首先进行什么操作？','','\"[\\\"A. TCP连接\\\",\\\"B. DNS解析\\\",\\\"C. HTTP请求\\\",\\\"D. SSL握手\\\"]\"','B','先DNS解析域名获IP地址，再建立连接。',5.00,2,1,'2026-06-16 21:20:35'),(96,4,10,'judge','medium','防火墙可以完全防止所有网络攻击。','',NULL,'false','防火墙是最基本的防护，不能防止所有攻击。',5.00,2,1,'2026-06-16 21:20:35'),(97,5,3,'single','medium','Linux中用于创建新目录的命令是？','','\"[\\\"A. cd\\\",\\\"B. mkdir\\\",\\\"C. rmdir\\\",\\\"D. ls\\\"]\"','B','mkdir=make directory。',5.00,3,1,'2026-06-16 21:20:35'),(98,5,6,'single','easy','Linux中用于列出文件列表的命令是？','','\"[\\\"A. dir\\\",\\\"B. list\\\",\\\"C. ls\\\",\\\"D. show\\\"]\"','C','ls=list。',5.00,3,1,'2026-06-16 21:20:35'),(99,5,4,'fill','medium','操作系统通过____机制来防止进程无限等待资源。','',NULL,'死锁检测/死锁避免','银行家算法是经典死锁避免算法。',6.00,3,1,'2026-06-16 21:20:35'),(100,6,19,'single','easy','HTML中用于显示图片的标签是？','','\"[\\\"A. <pic>\\\",\\\"B. <image>\\\",\\\"C. <img>\\\",\\\"D. <photo>\\\"]\"','C','<img src=\"url\">。',5.00,3,1,'2026-06-16 21:20:35'),(101,6,20,'single','easy','JavaScript中声明变量的关键字不包括？','','\"[\\\"A. var\\\",\\\"B. let\\\",\\\"C. const\\\",\\\"D. int\\\"]\"','D','JS无int，有var/let/const。',5.00,3,1,'2026-06-16 21:20:35'),(102,6,19,'single','medium','CSS中Flexbox布局中，justify-content属性用于？','','\"[\\\"A. 垂直对齐\\\",\\\"B. 水平对齐\\\",\\\"C. 换行方式\\\",\\\"D. 排序方式\\\"]\"','B','justify-content控制主轴(水平)对齐。',5.00,3,1,'2026-06-16 21:20:35'),(103,7,22,'single','easy','Git是什么类型的工具？','','\"[\\\"A. 编译器\\\",\\\"B. 版本控制系统\\\",\\\"C. 测试框架\\\",\\\"D. 部署工具\\\"]\"','B','Git是分布式版本控制系统。',5.00,3,1,'2026-06-16 21:20:35'),(104,7,25,'single','medium','Scrum框架中，一个迭代(Sprint)通常持续多久？','','\"[\\\"A. 1天\\\",\\\"B. 1-4周\\\",\\\"C. 3个月\\\",\\\"D. 1年\\\"]\"','B','Sprint通常1-4周，2周最常见。',5.00,3,1,'2026-06-16 21:20:35'),(105,7,23,'fill','medium','软件工程中，____是指软件满足用户需求的程度。','',NULL,'软件质量','功能性、可靠性、易用性、效率等都是质量属性。',6.00,3,1,'2026-06-16 21:20:35'),(106,1,1,'single','medium','云计算的服务模式不包括？','','\"[\\\"A. IaaS\\\",\\\"B. PaaS\\\",\\\"C. SaaS\\\",\\\"D. DaaS\\\"]\"','D','三大服务：IaaS/PaaS/SaaS。',5.00,1,1,'2026-06-16 21:20:35'),(107,1,1,'single','medium','NVMe SSD比SATA SSD快的原因？','','\"[\\\"A. 使用PCIe通道\\\",\\\"B. 容量更大\\\",\\\"C. 更便宜\\\",\\\"D. 更省电\\\"]\"','A','NVMe基于PCIe，速度远超SATA。',5.00,1,1,'2026-06-16 21:20:35'),(108,2,15,'single','easy','Java中String类型是？','','\"[\\\"A. 基本类型\\\",\\\"B. 引用类型\\\",\\\"C. 值类型\\\",\\\"D. 指针类型\\\"]\"','B','String是引用类型。',5.00,1,1,'2026-06-16 21:20:35'),(109,2,15,'single','medium','Python中读取用户输入的函数是？','','\"[\\\"A. read()\\\",\\\"B. input()\\\",\\\"C. scan()\\\",\\\"D. get()\\\"]\"','B','input()返回字符串。',5.00,1,1,'2026-06-16 21:20:35'),(110,2,15,'fill','easy','Java程序的入口方法是____。','',NULL,'main','public static void main(String[] args)。',6.00,1,1,'2026-06-16 21:20:35'),(111,2,16,'single','medium','哈希表(HashMap)查找时间复杂度是？','','\"[\\\"A. O(log n)\\\",\\\"B. O(n)\\\",\\\"C. O(1)\\\",\\\"D. O(n²)\\\"]\"','C','HashMap平均O(1)。',5.00,1,1,'2026-06-16 21:20:35'),(112,2,16,'single','easy','链表插入删除的时间复杂度是？','','\"[\\\"A. O(1)\\\",\\\"B. O(n)\\\",\\\"C. O(log n)\\\",\\\"D. O(n²)\\\"]\"','A','已知位置O(1)。',5.00,1,1,'2026-06-16 21:20:35'),(113,2,17,'single','hard','Dijkstra算法解决什么问题？','','\"[\\\"A. 最短路径\\\",\\\"B. 最小生成树\\\",\\\"C. 拓扑排序\\\",\\\"D. 最大流\\\"]\"','A','Dijkstra单源最短路径。',5.00,1,1,'2026-06-16 21:20:35'),(114,3,12,'single','easy','以下不是聚合函数的是？','','\"[\\\"A. COUNT\\\",\\\"B. SUM\\\",\\\"C. AVG\\\",\\\"D. LIKE\\\"]\"','D','LIKE是匹配操作符。',5.00,2,1,'2026-06-16 21:20:35'),(115,3,11,'single','medium','数据库三大范式不包括？','','\"[\\\"A. 原子性\\\",\\\"B. 主键依赖\\\",\\\"C. 传递依赖\\\",\\\"D. 多值依赖\\\"]\"','D','1NF原子性/2NF完全依赖/3NF消除传递。',5.00,2,1,'2026-06-16 21:20:35'),(116,3,13,'single','hard','乐观锁的实现方式是？','','\"[\\\"A. 先锁数据再操作\\\",\\\"B. 版本号机制检查冲突\\\",\\\"C. 禁止并发\\\",\\\"D. 读写锁\\\"]\"','B','乐观锁用版本号，提交时检查。',5.00,2,1,'2026-06-16 21:20:35'),(117,4,7,'single','easy','网络层的主要功能是？','','\"[\\\"A. 路由选择\\\",\\\"B. 可靠传输\\\",\\\"C. 数据加密\\\",\\\"D. 域名解析\\\"]\"','A','网络层负责路由。',5.00,2,1,'2026-06-16 21:20:35'),(118,4,8,'single','medium','TCP和UDP的主要区别？','','\"[\\\"A. TCP面向连接UDP无连接\\\",\\\"B. UDP比TCP慢\\\",\\\"C. TCP不保证可靠\\\",\\\"D. UDP有流量控制\\\"]\"','A','TCP可靠面向连接，UDP不可靠无连接。',5.00,2,1,'2026-06-16 21:20:35'),(119,4,9,'single','easy','HTTP属于OSI哪一层？','','\"[\\\"A. 传输层\\\",\\\"B. 网络层\\\",\\\"C. 应用层\\\",\\\"D. 链路层\\\"]\"','C','HTTP是应用层协议。',5.00,2,1,'2026-06-16 21:20:35'),(120,4,10,'single','medium','CSRF攻击的全称是？','','\"[\\\"A. 跨站脚本\\\",\\\"B. 跨站请求伪造\\\",\\\"C. SQL注入\\\",\\\"D. DDoS\\\"]\"','B','CSRF=Cross-Site Request Forgery。',5.00,2,1,'2026-06-16 21:20:35'),(121,5,3,'single','easy','Linux查看内存使用量的命令？','','\"[\\\"A. df\\\",\\\"B. free\\\",\\\"C. du\\\",\\\"D. top\\\"]\"','B','free查看内存。',5.00,3,1,'2026-06-16 21:20:35'),(122,5,3,'single','medium','Docker属于什么技术？','','\"[\\\"A. 虚拟机\\\",\\\"B. 容器化\\\",\\\"C. 数据库\\\",\\\"D. 编程语言\\\"]\"','B','Docker是容器化平台。',5.00,3,1,'2026-06-16 21:20:35'),(123,5,4,'single','hard','避免死锁的方法不包括？','','\"[\\\"A. 破坏互斥\\\",\\\"B. 破坏保持等待\\\",\\\"C. 增加线程\\\",\\\"D. 破坏循环等待\\\"]\"','C','增加线程不能避免死锁。',5.00,3,1,'2026-06-16 21:20:35'),(124,6,19,'single','easy','CSS设置字体大小的属性？','','\"[\\\"A. font-weight\\\",\\\"B. font-size\\\",\\\"C. text-size\\\",\\\"D. font-style\\\"]\"','B','font-size。',5.00,3,1,'2026-06-16 21:20:35'),(125,6,20,'single','medium','AJAX readyState=4表示？','','\"[\\\"A. 未初始化\\\",\\\"B. 已发送\\\",\\\"C. 接收中\\\",\\\"D. 请求完成\\\"]\"','D','4=完成。',5.00,3,1,'2026-06-16 21:20:35'),(126,6,20,'single','medium','以下不是前端框架的是？','','\"[\\\"A. React\\\",\\\"B. Vue\\\",\\\"C. Angular\\\",\\\"D. Django\\\"]\"','D','Django是Python后端框架。',5.00,3,1,'2026-06-16 21:20:35'),(127,6,21,'single','easy','Vue中条件渲染指令是？','','\"[\\\"A. v-model\\\",\\\"B. v-for\\\",\\\"C. v-if\\\",\\\"D. v-bind\\\"]\"','C','v-if条件渲染。',5.00,3,1,'2026-06-16 21:20:35'),(128,7,22,'single','easy','Git提交本地仓库的命令？','','\"[\\\"A. git push\\\",\\\"B. git commit\\\",\\\"C. git add\\\",\\\"D. git pull\\\"]\"','B','commit提交本地。',5.00,3,1,'2026-06-16 21:20:35'),(129,7,24,'single','medium','单元测试中Mock的作用？','','\"[\\\"A. 模拟外部依赖\\\",\\\"B. 测试UI\\\",\\\"C. 性能测试\\\",\\\"D. 安全测试\\\"]\"','A','Mock模拟外部依赖。',5.00,3,1,'2026-06-16 21:20:35'),(130,7,22,'single','easy','GitHub是什么？','','\"[\\\"A. 代码托管平台\\\",\\\"B. 编程语言\\\",\\\"C. 数据库\\\",\\\"D. OS\\\"]\"','A','GitHub=代码托管平台。',5.00,3,1,'2026-06-16 21:20:35'),(131,7,23,'single','medium','MVP的全称是什么？','','\"[\\\"A. 最优秀产品\\\",\\\"B. 最小可行产品\\\",\\\"C. 多版本产品\\\",\\\"D. 主要产品\\\"]\"','B','MVP=Minimum Viable Product。',5.00,3,1,'2026-06-16 21:20:35'),(132,5,6,'single','medium','Linux chmod 755表示？','','\"[\\\"A. 所有人可读写执行\\\",\\\"B. 所有者rwx组rx其他rx\\\",\\\"C. 所有者rw\\\",\\\"D. 只读\\\"]\"','B','7=rwx,5=r-x。',5.00,3,1,'2026-06-16 21:20:35'),(133,3,12,'single','medium','防SQL注入的措施不包括？','','\"[\\\"A. 参数化查询\\\",\\\"B. 输入过滤\\\",\\\"C. ORM\\\",\\\"D. 禁用外键\\\"]\"','D','外键与注入无关。',5.00,2,1,'2026-06-16 21:20:35'),(134,4,8,'fill','medium','为解决IPv4地址耗尽，____协议提供128位地址。','',NULL,'IPv6','IPv6=128位地址。',6.00,2,1,'2026-06-16 21:20:35');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_sessions`
--

DROP TABLE IF EXISTS `study_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int DEFAULT '0',
  `session_type` varchar(20) DEFAULT 'practice',
  `question_count` int DEFAULT '0',
  `correct_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `study_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_sessions`
--

LOCK TABLES `study_sessions` WRITE;
/*!40000 ALTER TABLE `study_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `study_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `role` enum('admin','teacher','student') NOT NULL DEFAULT 'student',
  `phone` varchar(20) DEFAULT '',
  `avatar` varchar(255) DEFAULT '',
  `gender` enum('male','female','other') DEFAULT 'other',
  `birth_date` date DEFAULT NULL,
  `email` varchar(100) DEFAULT '',
  `student_no` varchar(50) DEFAULT '',
  `department` varchar(100) DEFAULT '',
  `status` tinyint DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$q3PgWtJHAxJIMeBPwblVpeYL8VKgwEqh6EQl.HMs5NBCL0h1r5SzS','系统管理员','admin','13800000000','','male','1985-01-01','admin@exam.com','','管理部',1,'2026-06-16 21:20:35'),(2,'teacher','$2a$10$LqOI41hlVRqSveyHwwEwT.3fKwh5TyojLtdDGpsS1W5S8Q8Geh4q.','张教授','teacher','13900000001','','male','1988-05-15','zhang@exam.com','','计算机系',1,'2026-06-16 21:20:35'),(3,'teacher2','$2a$10$LqOI41hlVRqSveyHwwEwT.3fKwh5TyojLtdDGpsS1W5S8Q8Geh4q.','李讲师','teacher','13900000002','','female','1990-08-22','li@exam.com','','数学系',1,'2026-06-16 21:20:35'),(4,'student','$2a$10$LqOI41hlVRqSveyHwwEwT.3fKwh5TyojLtdDGpsS1W5S8Q8Geh4q.','王同学','student','13811111111','','male','2000-03-10','wang@exam.com','2021001','计算机系',1,'2026-06-16 21:20:35'),(5,'student2','$2a$10$LqOI41hlVRqSveyHwwEwT.3fKwh5TyojLtdDGpsS1W5S8Q8Geh4q.','赵同学','student','13811111112','','female','2001-07-20','zhao@exam.com','2021002','数学系',1,'2026-06-16 21:20:35'),(6,'student3','$2a$10$LqOI41hlVRqSveyHwwEwT.3fKwh5TyojLtdDGpsS1W5S8Q8Geh4q.','陈同学','student','13811111113','','male','2000-11-05','chen@exam.com','2021003','物理系',1,'2026-06-16 21:20:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wrong_book`
--

DROP TABLE IF EXISTS `wrong_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wrong_book` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `exam_record_id` int DEFAULT NULL,
  `wrong_answer` text,
  `review_count` int DEFAULT '0',
  `mastered` tinyint DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `wrong_book_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `wrong_book_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wrong_book`
--

LOCK TABLES `wrong_book` WRITE;
/*!40000 ALTER TABLE `wrong_book` DISABLE KEYS */;
INSERT INTO `wrong_book` VALUES (1,4,129,NULL,'B',0,0,'2026-06-16 21:21:36'),(2,4,1,1,'C',0,0,'2026-06-16 21:21:46'),(3,4,25,2,'C',0,0,'2026-06-16 21:22:53'),(4,4,26,2,'C',0,0,'2026-06-16 21:22:53'),(5,4,27,2,'B',0,0,'2026-06-16 21:22:53'),(6,4,28,2,'C',0,0,'2026-06-16 21:22:53'),(7,4,29,2,'B',0,0,'2026-06-16 21:22:53'),(8,4,32,2,'C',0,0,'2026-06-16 21:22:53'),(9,4,34,2,'D',0,0,'2026-06-16 21:22:53'),(10,4,35,2,'B',0,0,'2026-06-16 21:22:53');
/*!40000 ALTER TABLE `wrong_book` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17 12:41:04
