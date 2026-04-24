import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getInstalledVersions: () => Promise<any[]>
      installVersion: (data: { url: string; id: string }) => Promise<{ success: boolean }>
      switchGlobal: (id: string) => Promise<{ success: boolean }>
      getProjects: () => Promise<any[]>
      addProject: (project: any) => Promise<{ success: boolean }>
      updateProject: (project: any) => Promise<{ success: boolean }>
      deleteProject: (id: string) => Promise<{ success: boolean }>
      selectFolder: () => Promise<string | null>
      openTerminal: (phpPath: string, workingDir?: string) => Promise<{ success: boolean }>
      openEnvEditor: () => Promise<{ success: boolean }>
      openFolder: (path: string) => Promise<{ success: boolean }>
      uninstallPHP: (id: string) => Promise<{ success: boolean }>
      openPhpIni: (phpPath: string) => Promise<{ success: boolean }>
    }
  }
}
