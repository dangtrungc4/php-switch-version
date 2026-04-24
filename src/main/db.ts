import { app } from 'electron'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import path from 'path'

export interface AppData {
  projects: {
    id: string
    name: string
    path: string
    phpVersionId: string
  }[]
  settings: {
    globalPhpVersionId: string
  }
}

const defaultData: AppData = {
  projects: [],
  settings: {
    globalPhpVersionId: ''
  }
}

export async function getDb(): Promise<Low<AppData>> {
  const dbPath = path.join(app.getPath('userData'), 'db.json')
  const db = await JSONFilePreset<AppData>(dbPath, defaultData)
  return db
}
