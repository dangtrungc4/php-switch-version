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
        currentTarget = fs.realpathSync(this.currentLink)
      }
    } catch (e) {
      console.error('Error reading current symlink:', e)
    }

    return folders.map((folder) => {
      const fullPath = path.join(this.versionsDir, folder)
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
    const baseDir = path.resolve(this.baseDir)
    const versionsDir = path.resolve(this.versionsDir)
    const zipPath = path.join(baseDir, `${id}.zip`)
    const destDir = path.join(versionsDir, id)

    try {
      if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })
      if (!fs.existsSync(versionsDir)) fs.mkdirSync(versionsDir, { recursive: true })
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
    } catch (err: any) {
      throw new Error(
        `Failed to create directories: ${err.message}. Please ensure the app has Administrator rights.`
      )
    }

    try {
      console.log(`Downloading PHP from: ${url}`)
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 60000,

        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      const writer = fs.createWriteStream(zipPath)
      response.data.pipe(writer)

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => {
          writer.close()
          resolve()
        })
        writer.on('error', (err) => {
          writer.close()
          if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)
          reject(err)
        })
        response.data.on('error', (err) => {
          writer.close()
          if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)
          reject(err)
        })
      })

      if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
        throw new Error(`Download failed: Zip file is empty or missing at ${zipPath}`)
      }

      console.log(`Extracting to: ${destDir}`)
      const zip = new StreamZip.async({ file: zipPath })
      await zip.extract(null, destDir)
      await zip.close()

      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

      const iniPath = path.join(destDir, 'php.ini')
      const productionIni = path.join(destDir, 'php.ini-production')
      const developmentIni = path.join(destDir, 'php.ini-development')

      if (!fs.existsSync(iniPath)) {
        if (fs.existsSync(productionIni)) {
          fs.copyFileSync(productionIni, iniPath)
        } else if (fs.existsSync(developmentIni)) {
          fs.copyFileSync(developmentIni, iniPath)
        }
      }
    } catch (error: any) {
      if (fs.existsSync(zipPath)) {
        try {
          fs.unlinkSync(zipPath)
        } catch (e) {}
      }
      console.error('Error installing version:', error)
      throw new Error(error.message || 'Unknown error during installation')
    }
  }

  async uninstall(id: string): Promise<{ success: boolean; error?: string }> {
    const destDir = path.join(this.versionsDir, id)
    if (!fs.existsSync(destDir)) return { success: false, error: 'Version not found' }

    try {
      let isActive = false
      if (fs.existsSync(this.currentLink)) {
        try {
          const currentTarget = fs.realpathSync(this.currentLink)
          if (currentTarget.toLowerCase() === destDir.toLowerCase()) {
            isActive = true
          }
        } catch (e) {}
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
    const cdCmd = workingDir ? `cd /d "${workingDir}" & ` : ''
    return `cmd /k "${cdCmd}set PATH=${phpPath};%PATH% & php -v"`
  }
}
