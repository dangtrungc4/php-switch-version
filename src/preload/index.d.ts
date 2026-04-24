interface PHPVersion {
  id: string
  version: string
  arch: 'x64' | 'x86'
  type: 'ts' | 'nts'
  path: string
  installed: boolean
  active: boolean
}

interface AvailableVersion {
  id: string
  version: string
  type: 'TS' | 'NTS'
  arch: 'x64' | 'x86'
  url: string
}

interface Project {
  id: string
  name: string
  path: string
  phpVersionId: string
}

interface Window {
  api: {
    getInstalledVersions: () => Promise<PHPVersion[]>
    installVersion: (data: { url: string; id: string }) => Promise<{ success: boolean }>
    switchGlobal: (id: string) => Promise<{ success: boolean }>
    getProjects: () => Promise<Project[]>
    addProject: (project: Project) => Promise<{ success: boolean }>
    updateProject: (project: Project) => Promise<{ success: boolean }>
    deleteProject: (id: string) => Promise<{ success: boolean }>
    selectFolder: () => Promise<string | null>
    openTerminal: (phpPath: string, workingDir?: string) => Promise<{ success: boolean }>
    openEnvEditor: () => Promise<{ success: boolean }>
    openFolder: (path: string) => Promise<{ success: boolean }>
    uninstallPHP: (id: string) => Promise<{ success: boolean }>
    openPhpIni: (phpPath: string) => Promise<{ success: boolean }>
    getAvailableVersions: () => Promise<AvailableVersion[]>
  }
  electron: any
}