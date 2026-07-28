const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const VIDEO_EXTS = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.m4v', '.ts', '.rmvb'];

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // 按 F12 打开开发者工具（方便排查）
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });
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

// 用系统资源管理器打开文件夹（真正呼出 Windows 文件资源管理器）
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    const err = await shell.openPath(folderPath);
    return !err; // 返回空字符串表示成功
  } catch (e) {
    return false;
  }
});

// 原生选择文件夹对话框，返回真实完整路径
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择子账号文件夹',
    properties: ['openDirectory'],
  });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// 统计文件夹内视频数量（用真实文件系统读取）
ipcMain.handle('count-videos', async (event, dir) => {
  try {
    const files = fs.readdirSync(dir);
    return files.filter((f) => VIDEO_EXTS.includes(path.extname(f).toLowerCase())).length;
  } catch (e) {
    return 0;
  }
});
