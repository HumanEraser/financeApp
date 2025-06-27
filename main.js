const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let mainWindow;
let currentUser = null;

// Initialize the database
const db = new Database(path.join(__dirname, 'database', 'finance.db'));

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ✅ IPC HANDLERS

// Login handler
ipcMain.handle('login', (event, { username, password }) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
  const user = stmt.get(username, password);
  if (user) {
    currentUser = user;
    return { success: true, role: user.role };
  } else {
    return { success: false, message: 'Invalid credentials' };
  }
});

// Logout
ipcMain.handle('logout', () =>{
  currentUser = null;
})

// Get current user
ipcMain.handle('get-current-user', () =>{
  return currentUser;
})

// Get all users
ipcMain.handle('get-all-users', () => {
  return db.prepare('SELECT * FROM users').all();
});

// Add a new user
ipcMain.handle('add-user', (event, userData) => {
  const { username, password, role } = userData;
  return db
    .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
    .run(username, password, role);
});

// Update an existing user
ipcMain.handle('update-user', (event, userData) => {
  const { id, username, password, role } = userData;
  return db
    .prepare('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?')
    .run(username, password, role, id);
});

// Delete a user
ipcMain.handle('delete-user', (event, userId) => {
  return db.prepare('DELETE FROM users WHERE id = ?').run(userId);
});

// Get all transactions
ipcMain.handle('get-all-transactions', () => {
  return db.prepare(`
    SELECT
      transactions.*,
      users.username
    FROM
      transactions
    INNER JOIN
      users ON transactions.user_id = users.id
    `).all();
});

// Get Transaction Specific
ipcMain.handle('get-my-transactions', (event, userData) =>{
  const { id } = userData;
  console.log(id)
  const stmt = db.prepare('SELECT * FROM transactions WHERE user_id = ?')
  const result = stmt.all(userData);
  console.log("Query result:", result);
  return result;
})

ipcMain.handle('add-transaction', (event, transactionData) => {
  const { amount, type, category, date, note, userId } = transactionData;
    const stmt = db.prepare('INSERT INTO transactions (amount, type, category, date, note, user_id) VALUES (?, ?, ?, ?, ?, ?)')
    const result = stmt.run(amount, type, category, date, note, userId);
    return result;
});

ipcMain.handle('edit-transaction', (event, transactionData) =>{
  const { id, amount, type, category, date, note } = transactionData;
  const stmt = db.prepare('UPDATE transactions SET amount = ?, type = ?, category = ?, date = ?, note = ? WHERE id = ?');
  const result = stmt.run(amount, type, category, date, note, id);
  return result;
})

ipcMain.handle('delete-transaction', (event, transactionData) => {
  const id = typeof transactionData === 'object' ? transactionData.id : transactionData;
  return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
});