import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { Project } from '../main/php-manager'
const api = {
  getInstalledVersions: () => ipcRenderer.invoke('get-installed-versions'),
  installVersion: (data: { url: string; id: string }) =>
    ipcRenderer.invoke('install-version', data),
  switchGlobal: (id: string) => ipcRenderer.invoke('switch-global', id),
  getProjects: () => ipcRenderer.invoke('get-projects'),
  addProject: (project: Project) => ipcRenderer.invoke('add-project', project),
  updateProject: (project: Project) => ipcRenderer.invoke('update-project', project),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openTerminal: (phpPath: string, workingDir?: string) =>
    ipcRenderer.invoke('open-terminal', phpPath, workingDir),
  openEnvEditor: () => ipcRenderer.invoke('open-env-editor'),
  openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
  deleteProject: (id: string) => ipcRenderer.invoke('delete-project', id),
  uninstallPHP: (id: string) => ipcRenderer.invoke('uninstall-php', id),
  openPhpIni: (phpPath: string) => ipcRenderer.invoke('open-php-ini', phpPath),
  getAvailableVersions: () => ipcRenderer.invoke('get-available-versions'),
  restartPhp: () => ipcRenderer.invoke('restart-php'),
  onPhpConfigApplied: (callback: (data: { path: string }) => void) =>
    ipcRenderer.on('php-config-applied', (_event, data) => callback(data))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
