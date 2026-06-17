const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'exam_system',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

pool.getConnection()
  .then(conn => {
    console.log('MySQL 数据库连接成功');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL 连接失败:', err.message);
  });

module.exports = pool;
