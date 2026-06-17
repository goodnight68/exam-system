const m = require('mysql2/promise');
const f = require('fs');

(async () => {
  const c = await m.createConnection({
    host: 'localhost', port: 3306, user: 'root', password: '123456',
    multipleStatements: true, charset: 'utf8mb4'
  });
  const s = f.readFileSync('../../exam-system-java/backend/src/main/resources/sql/init.sql', 'utf8');
  await c.query(s);
  console.log('数据库初始化成功');
  await c.end();
})().catch(e => console.error(e.message));
