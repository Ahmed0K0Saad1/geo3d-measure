/**
 * تنسيق الجلسات بين المتاجر وRepository (T6.2 — ADR-035).
 * هذا الملف هو الحد الوحيد الذي يعرف Dexie من جهة الواجهة.
 */

import { createId } from '@/lib/ids.ts'
import {
  buildSessionSnapshot,
  sessionSignature,
} from '@/store/sessionSnapshot.ts'
import { usePointsStore } from '@/store/usePointsStore.ts'
import { usePolygonStore } from '@/store/usePolygonStore.ts'
import { useSessionStore } from '@/store/useSessionStore.ts'
import { useSettingsStore } from '@/store/useSettingsStore.ts'
import {
  deleteSession,
  getSession,
  listSessions,
  saveSession as saveSessionRecord,
} from './sessionRepository.ts'
import { getLastSessionId, setLastSessionId } from './settingsRepository.ts'
import type {
  SessionRecord,
  SessionSnapshot,
  SessionSummary,
} from './sessionTypes.ts'

/** لقطة مباشرة من المتاجر الحالية. */
export function captureSessionSnapshot(): SessionSnapshot {
  const points = usePointsStore.getState().points
  const polygon = usePolygonStore.getState()
  const settings = useSettingsStore.getState()
  return buildSessionSnapshot(points, polygon.vertices, polygon.status, {
    distanceUnit: settings.distanceUnit,
    areaUnit: settings.areaUnit,
    coordinateFormat: settings.coordinateFormat,
  })
}

/** يطبّق لقطة على المتاجر ويطلب تأطير البيانات بعد الاستعادة. */
export function applySessionSnapshot(snapshot: SessionSnapshot): void {
  usePointsStore.getState().replacePoints(snapshot.points)
  usePolygonStore
    .getState()
    .replacePolygon(snapshot.polygon.vertices, snapshot.polygon.closed)
  useSettingsStore.getState().hydrate(snapshot.settings)
  useSessionStore.getState().requestFitAll()
}

function snapshotOf(record: SessionRecord): SessionSnapshot {
  return {
    points: record.points,
    polygon: record.polygon,
    settings: record.settings,
  }
}

/** حفظ صريح: ينشئ الجلسة إن لم تكن موجودة ويحدّث آخر جلسة. */
export async function saveCurrentSession(name: string): Promise<SessionRecord> {
  const session = useSessionStore.getState()
  const snapshot = captureSessionSnapshot()
  const id = session.id ?? createId('session')
  const finalName = name.trim() || session.name.trim() || 'Session'
  const record = await saveSessionRecord({ id, name: finalName, snapshot })
  const signature = sessionSignature(snapshot)

  useSessionStore.getState().hydrateSession({
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastSavedSignature: signature,
  })
  await setLastSessionId(record.id)
  return record
}

/** حفظ تلقائي لقطة ملتقطة مسبقًا؛ لا يمس جلسة أخرى إن تم التبديل. */
export async function saveSessionSnapshot(input: {
  id: string
  name: string
  snapshot: SessionSnapshot
  signature: string
}): Promise<SessionRecord> {
  const record = await saveSessionRecord({
    id: input.id,
    name: input.name,
    snapshot: input.snapshot,
  })
  if (useSessionStore.getState().id === input.id) {
    useSessionStore.getState().markSaved({
      updatedAt: record.updatedAt,
      lastSavedSignature: input.signature,
    })
  }
  return record
}

/** يفتح جلسة محفوظة في المتاجر؛ `null` إذا لم توجد. */
export async function loadSessionIntoStores(
  id: string,
): Promise<SessionRecord | null> {
  const record = await getSession(id)
  if (!record) {
    return null
  }

  applySessionSnapshot(snapshotOf(record))
  useSessionStore.getState().hydrateSession({
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastSavedSignature: sessionSignature(snapshotOf(record)),
  })
  await setLastSessionId(record.id)
  return record
}

/** يستعيد آخر جلسة عند الإقلاع؛ ينظّف المؤشر إن حُذف السجل. */
export async function restoreLastSession(): Promise<boolean> {
  const lastId = await getLastSessionId()
  if (!lastId) {
    return false
  }
  const record = await loadSessionIntoStores(lastId)
  if (!record) {
    await setLastSessionId(null)
    return false
  }
  return true
}

/** جلسة جديدة فارغة مع الإبقاء على إعدادات العرض. */
export async function startNewSession(): Promise<void> {
  usePointsStore.getState().replacePoints([])
  usePolygonStore.getState().clear()
  useSessionStore.getState().reset()
  await setLastSessionId(null)
}

/** حذف جلسة؛ إن كانت الحالية تُفرّغ مساحة العمل. */
export async function deleteSessionById(id: string): Promise<boolean> {
  const deleted = await deleteSession(id)
  if (!deleted) {
    return false
  }
  if (useSessionStore.getState().id === id) {
    await startNewSession()
  } else if ((await getLastSessionId()) === id) {
    await setLastSessionId(null)
  }
  return true
}

export function listSavedSessions(): Promise<SessionSummary[]> {
  return listSessions()
}
