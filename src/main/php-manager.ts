import axios from 'axios'
import fs from 'fs'
import StreamZip from 'node-stream-zip'
import path from 'path'
import sudo from 'sudo-prompt'

export interface PHPVersion {
  id: string
  version: string
  arch: 'x64' | 'x86'
  type: 'ts' | 'nts'
  path: string
  installed: boolean
  active: boolean
}

export interface Project {
  id: string
  name: string
  path: string
  phpVersionId: string
}

export class PHPManager {
  private baseDir = 'C:\\PHPManager'
  private versionsDir = path.join(this.baseDir, 'versions')
  private currentLink = path.join(this.baseDir, 'current')

  constructor() {
    this.ensureDirs()
  }

  private ensureDirs() {
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true })
    if (!fs.existsSync(this.versionsDir)) fs.mkdirSync(this.versionsDir, { recursive: true })
  }

  async getInstalledVersions(): Promise<PHPVersion[]> {
    if (!fs.existsSync(this.versionsDir)) return []
    const folders = fs.readdirSync(this.versionsDir)

    let currentTarget = ''
    try {
      if (fs.existsSync(this.currentLink)) {
        // readlink doesn't always work for directory junctions/symlinks on Windows as expected with fs.readlink
        // but we can try to get the real path
        currentTarget = fs.realpathSync(this.currentLink)
      }
    } catch (e) {
      console.error('Error reading current symlink:', e)
    }

    return folders.map((folder) => {
      const fullPath = path.join(this.versionsDir, folder)
      // Simple parsing: php-8.2.0-x64-ts
      const parts = folder.split('-')
      return {
        id: folder,
        version: parts[1] || folder,
        arch: (parts[2] as any) || 'x64',
        type: (parts[3] as any) || 'ts',
        path: fullPath,
        installed: true,
        active: currentTarget.toLowerCase() === fullPath.toLowerCase()
      }
    })
  }

  async downloadAndInstall(url: string, id: string): Promise<void> {
    const zipPath = path.join(this.baseDir, `${id}.zip`)
    const destDir = path.join(this.versionsDir, id)

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir)

    // Download
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    const writer = fs.createWriteStream(zipPath)
    response.data.pipe(writer)

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve())
      writer.on('error', reject)
    })

    // Extract
    const zip = new StreamZip.async({ file: zipPath })
    await zip.extract(null, destDir)
    await zip.close()

    // Cleanup
    fs.unlinkSync(zipPath)

    // Setup php.ini
    const iniPath = path.join(destDir, 'php.ini')
    const productionIni = path.join(destDir, 'php.ini-production')
    if (fs.existsSync(productionIni) && !fs.existsSync(iniPath)) {
      fs.copyFileSync(productionIni, iniPath)
    }
  }

  async uninstall(id: string): Promise<{ success: boolean; error?: string }> {
    const destDir = path.join(this.versionsDir, id)
    if (!fs.existsSync(destDir)) return { success: false, error: 'Version not found' }

    try {
      // Check if it's the active version
      let isActive = false
      if (fs.existsSync(this.currentLink)) {
        try {
          const currentTarget = fs.realpathSync(this.currentLink)
          if (currentTarget.toLowerCase() === destDir.toLowerCase()) {
            isActive = true
          }
        } catch (e) {
          // If junction is broken, we might still want to clean up destDir
        }
      }

      if (isActive) {
        fs.rmSync(this.currentLink, { recursive: true, force: true })
      }

      fs.rmSync(destDir, { recursive: true, force: true })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  async switchGlobal(id: string): Promise<void> {
    const targetDir = path.join(this.versionsDir, id)
    if (!fs.existsSync(targetDir)) throw new Error('Version not found')

    // Create a combined command to:
    // 1. Remove old symlink if exists
    // 2. Create new symlink
    // 3. Update System PATH if not already present
    // We use a PowerShell script for this to handle logic cleanly in one elevation
    const psScript = `
      $link = '${this.currentLink}';
      $target = '${targetDir}';
      if (Test-Path $link) { 
        Remove-Item $link -Force -Recurse -ErrorAction SilentlyContinue
      }
      New-Item -ItemType Junction -Path $link -Value $target -Force;
      
      $mPath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine');
      if ($mPath -notlike '*'+$link+'*') {
        [System.Environment]::SetEnvironmentVariable('Path', $mPath + ';' + $link, 'Machine');
      }
    `
      .replace(/\n/g, ' ')
      .trim()

    const command = `powershell -Command "${psScript}"`

    return new Promise<void>((resolve, reject) => {
      sudo.exec(command, { name: 'PHP Version Manager' }, (error, _stdout, stderr) => {
        if (error) {
          console.error('Sudo exec error:', error)
          console.error('Stderr:', stderr)
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  async getTerminalCommand(phpPath: string, workingDir?: string): Promise<string> {
    // Returns a command to open a terminal with the specific PHP version prepended to PATH
    // If workingDir is provided, it will cd into it.
    const cdCmd = workingDir ? `cd /d "${workingDir}" & ` : ''
    return `cmd /k "${cdCmd}set PATH=${phpPath};%PATH% & php -v"`
  }
}
