/**
 * Repository الجلسات فوق Dexie (T6.1 — ADR-005/013/035):
 * الواجهة لا تعرف Dexie، وكل سجل يُتحقق بـzod قبل الحفظ وبعد التحميل.
 */

import { db } from '@/lib/dexie.ts'
import {
  sessionRecordSchema,
  type SaveSessionInput,
  type SessionRecord,
  type SessionSummary,
} from './sessionTypes.ts'

export type SessionRepositoryErrorCode =
  'invalid-session' | 'invalid-name' | 'not-found' | 'database'

export class SessionRepositoryError extends Error {
  readonly code: SessionRepositoryErrorCode

  constructor(code: SessionRepositoryErrorCode) {
    super(`session:${code}`)
    this.name = 'SessionRepositoryError'
    this.code = code
  }
}

function toError(error: unknown): SessionRepositoryError {
  if (error instanceof SessionRepositoryError) {
    return error
  }
  return new SessionRepositoryError('database')
}

/** قائمة ملخصة مرتبة بالأحدث حفظًا. */
export async function listSessions(): Promise<SessionSummary[]> {
  try {
    const records = await db.sessions.orderBy('updatedAt').reverse().toArray()
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      pointCount: Array.isArray(record.points) ? record.points.length : 0,
    }))
  } catch (error) {
    throw toError(error)
  }
}

/** يحمّل جلسة ويتحقق من سلامتها؛ `null` إذا لم توجد. */
export async function getSession(id: string): Promise<SessionRecord | null> {
  try {
    const record = await db.sessions.get(id)
    if (!record) {
      return null
    }
    try {
      return sessionRecordSchema.parse(record)
    } catch {
      throw new SessionRepositoryError('invalid-session')
    }
  } catch (error) {
    throw toError(error)
  }
}

/** ينشئ جلسة أو يحدّثها مع الحفاظ على `createdAt`. */
export async function saveSession(
  input: SaveSessionInput,
): Promise<SessionRecord> {
  const name = input.name.trim()
  if (name === '') {
    throw new SessionRepositoryError('invalid-name')
  }

  try {
    const existing = await db.sessions.get(input.id)
    const now = new Date()
    const record: SessionRecord = {
      id: input.id,
      name,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      version: 1,
      points: input.snapshot.points,
      polygon: input.snapshot.polygon,
      settings: input.snapshot.settings,
    }
    const parsed = sessionRecordSchema.parse(record)
    await db.sessions.put(parsed)
    return parsed
  } catch (error) {
    throw toError(error)
  }
}

export async function deleteSession(id: string): Promise<boolean> {
  try {
    const existing = await db.sessions.get(id)
    if (!existing) {
      return false
    }
    await db.sessions.delete(id)
    return true
  } catch (error) {
    throw toError(error)
  }
}
