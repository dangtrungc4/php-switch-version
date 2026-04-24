import { JSONFilePreset } from 'lowdb/node'

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

export async function getDb() {
  const db = await JSONFilePreset<AppData>('db.json', defaultData)
  return db
}
