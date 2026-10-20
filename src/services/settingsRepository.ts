/**
 * Repository إعدادات التطبيق فوق Dexie (T6.1 — ADR-005/013/035).
 */

import { db } from '@/lib/dexie.ts'
import {
  appSettingsRecordSchema,
  appSettingsSchema,
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  type AppSettingsRecord,
} from './settingsTypes.ts'

export type SettingsRepositoryErrorCode = 'invalid-settings' | 'database'

export class SettingsRepositoryError extends Error {
  readonly code: SettingsRepositoryErrorCode

  constructor(code: SettingsRepositoryErrorCode) {
    super(`settings:${code}`)
    this.name = 'SettingsRepositoryError'
    this.code = code
  }
}

function toError(error: unknown): SettingsRepositoryError {
  if (error instanceof SettingsRepositoryError) {
    return error
  }
  return new SettingsRepositoryError('database')
}

/** يعيد إعدادات التطبيق أو الافتراضيات عند أول تشغيل. */
export async function loadAppSettings(): Promise<AppSettings> {
  try {
    const record = await db.settings.get('app')
    if (!record) {
      return { ...DEFAULT_APP_SETTINGS }
    }
    const parsed = appSettingsRecordSchema.parse(record)
    return {
      distanceUnit: parsed.distanceUnit,
      areaUnit: parsed.areaUnit,
      coordinateFormat: parsed.coordinateFormat,
    }
  } catch (error) {
    if (error instanceof SettingsRepositoryError) {
      throw error
    }
    throw new SettingsRepositoryError('invalid-settings')
  }
}

/** يحفظ وحدات العرض وصيغة الإحداثيات مع الحفاظ على آخر جلسة. */
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  try {
    const parsedSettings = appSettingsSchema.parse(settings)
    const existing = await db.settings.get('app')
    const record: AppSettingsRecord = {
      key: 'app',
      ...parsedSettings,
      lastSessionId: existing?.lastSessionId ?? null,
      updatedAt: new Date(),
    }
    await db.settings.put(appSettingsRecordSchema.parse(record))
  } catch (error) {
    throw toError(error)
  }
}

export async function getLastSessionId(): Promise<string | null> {
  try {
    const record = await db.settings.get('app')
    if (!record) {
      return null
    }
    return appSettingsRecordSchema.parse(record).lastSessionId
  } catch (error) {
    throw toError(error)
  }
}

export async function setLastSessionId(id: string | null): Promise<void> {
  try {
    const existing = await db.settings.get('app')
    const record: AppSettingsRecord = {
      key: 'app',
      distanceUnit: existing?.distanceUnit ?? DEFAULT_APP_SETTINGS.distanceUnit,
      areaUnit: existing?.areaUnit ?? DEFAULT_APP_SETTINGS.areaUnit,
      coordinateFormat:
        existing?.coordinateFormat ?? DEFAULT_APP_SETTINGS.coordinateFormat,
      lastSessionId: id,
      updatedAt: new Date(),
    }
    await db.settings.put(appSettingsRecordSchema.parse(record))
  } catch (error) {
    throw toError(error)
  }
}
