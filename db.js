const Database = require('better-sqlite3');
const path = require('path');

// Database file will be saved alongside your main file
const db = new Database(path.join(__dirname, 'database', 'finance.db'));

// ✅ Create users table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    loggedIn INTEGER DEFAULT 0
  )
`).run();

// ✅ Seed IT account if it doesn’t exist
const existingIT = db.prepare('SELECT * FROM users WHERE role = ?').get('it');

if (!existingIT) {
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
    'it_admin', 'password123', 'it'
  );
}

// ✅ Get all users
function getAllUsers() {
  return db.prepare('SELECT * FROM users').all();
}

// ✅ Add new user
function addUser(user) {
  const { username, password, role } = user;
  return db
    .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
    .run(username, password, role);
}

// ✅ Update existing user
function updateUser(user) {
  const { id, username, password, role } = user;
  return db
    .prepare('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?')
    .run(username, password, role, id);
}

// ✅ Delete user
function deleteUser(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

module.exports = {
  db,
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
};
