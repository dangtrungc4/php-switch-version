import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { exec, execSync } from 'child_process'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { getDb } from './db'
import { PHPManager } from './php-manager'

function isElevated(): boolean {
  try {
    execSync('net session', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  if (process.platform === 'win32' && !isElevated()) {
    // Attempt to relaunch as administrator
    const args = process.argv.slice(1).join(' ')
    const command = `Start-Process -FilePath "${process.execPath}" -ArgumentList "${args.replace(/"/g, '`"')}" -Verb RunAs`

    exec(`powershell.exe -Command "${command}"`, (error) => {
      if (error) {
        dialog.showErrorBox(
          'Administrator Rights Required',
          'This application needs Administrator rights to manage symlinks and environment variables. Please restart the app as Administrator.'
        )
        app.quit()
      } else {
        app.quit()
      }
    })
    return
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.phpmanager.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // PHP Manager Instance
  const phpManager = new PHPManager()

  // IPC Handlers
  ipcMain.handle('get-installed-versions', async () => {
    return await phpManager.getInstalledVersions()
  })

  ipcMain.handle('get-available-versions', async () => {
    return await phpManager.getAvailableVersions()
  })

  ipcMain.handle('install-version', async (_, { url, id }) => {
    await phpManager.downloadAndInstall(url, id)
    return { success: true }
  })

  ipcMain.handle('switch-global', async (_, id) => {
    await phpManager.switchGlobal(id)
    const db = await getDb()
    await db.update((data) => (data.settings.globalPhpVersionId = id))
    return { success: true }
  })

  ipcMain.handle('uninstall-php', async (_, id) => {
    return await phpManager.uninstall(id)
  })

  ipcMain.handle('open-php-ini', async (_, phpPath) => {
    const iniPath = path.join(phpPath, 'php.ini')
    if (fs.existsSync(iniPath)) {
      shell.openPath(iniPath)
      return { success: true }
    } else {
      // Try development or production template
      const devIni = path.join(phpPath, 'php.ini-development')
      if (fs.existsSync(devIni)) {
        fs.copyFileSync(devIni, iniPath)
        shell.openPath(iniPath)
        return { success: true }
      }
    }
    return { success: false, error: 'php.ini not found' }
  })

  ipcMain.handle('get-projects', async () => {
    const db = await getDb()
    return db.data.projects
  })

  ipcMain.handle('add-project', async (_, project) => {
    const db = await getDb()
    await db.update((data) => data.projects.push(project))
    return { success: true }
  })

  ipcMain.handle('update-project', async (_, project) => {
    const db = await getDb()
    await db.update((data) => {
      const index = data.projects.findIndex((p) => p.id === project.id)
      if (index !== -1) {
        data.projects[index] = { ...data.projects[index], ...project }
      }
    })
    return { success: true }
  })

  ipcMain.handle('delete-project', async (_, id) => {
    const db = await getDb()
    await db.update((data) => {
      data.projects = data.projects.filter((p) => p.id !== id)
    })
    return { success: true }
  })

  ipcMain.handle('open-folder', async (_, path) => {
    shell.openPath(path)
    return { success: true }
  })

  ipcMain.handle('select-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled) return null
    return filePaths[0]
  })

  ipcMain.handle('open-terminal', async (_, phpPath, workingDir) => {
    const command = await phpManager.getTerminalCommand(phpPath, workingDir)
    exec(`start ${command}`)
    return { success: true }
  })

  ipcMain.handle('open-env-editor', async () => {
    exec('rundll32.exe sysdm.cpl,EditEnvironmentVariables')
    return { success: true }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
