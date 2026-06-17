const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true
  });
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  await conn.query(sql);
  console.log('数据库初始化成功');
  await conn.end();
})().catch(err => {
  console.error('初始化失败:', err.message);
  process.exit(1);
});
