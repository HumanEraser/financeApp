console.log('Preload script loaded');
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Expose API methods and appConfig
contextBridge.exposeInMainWorld('api', {
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  logout: () => ipcRenderer.invoke('logout'),
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  addUser: (userData) => ipcRenderer.invoke('add-user', userData),
  updateUser: (userData) => ipcRenderer.invoke('update-user', userData),
  deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),
  transaction: (transactionData) => ipcRenderer.invoke('get-all-transactions', transactionData),
  addTransaction: (transactionData) => ipcRenderer.invoke('add-transaction', transactionData),
  editTransaction: (transactionData) => ipcRenderer.invoke('edit-transaction', transactionData),
  deleteTransaction:(transactionData) => ipcRenderer.invoke('delete-transaction', transactionData),
  getMyTransaction:(userData) => ipcRenderer.invoke('get-my-transactions', userData),
});
