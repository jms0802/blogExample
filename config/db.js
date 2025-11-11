const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error("❌ DB 연결 실패:", err.message);
    else console.log("✅ SQLite 연결 성공");
});

// 테이블 초기화 (한 번만 실행)
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username Text,
      password TEXT
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
