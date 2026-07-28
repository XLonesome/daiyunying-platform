const { contextBridge, ipcRenderer } = require('electron');

// 在渲染进程暴露安全的 Electron API
contextBridge.exposeInMainWorld('electronAPI', {
  // 用系统资源管理器打开文件夹
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  // 原生选择文件夹，返回完整路径字符串或 null
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  // 统计文件夹内视频数量
  countVideos: (folderPath) => ipcRenderer.invoke('count-videos', folderPath),
});
