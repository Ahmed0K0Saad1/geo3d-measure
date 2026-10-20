/**
 * قاعدة IndexedDB المحلية (T6.1 — ADR-013/035).
 * خلف Repository دائمًا؛ لا تلمس الواجهة Dexie مباشرة.
 */

import { Dexie, type Table } from 'dexie'
import type { AppSettingsRecord } from '@/services/settingsTypes.ts'
import type { SessionRecord } from '@/services/sessionTypes.ts'

export class Geo3dDatabase extends Dexie {
  sessions!: Table<SessionRecord, string>
  settings!: Table<AppSettingsRecord, string>

  constructor() {
    super('geo3d-measure')
    this.version(1).stores({
      sessions: 'id, updatedAt',
      settings: 'key',
    })
  }
}

export const db = new Geo3dDatabase()
