import 'fake-indexeddb/auto'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import { db } from '../src/lib/dexie.ts'
import {
  captureSessionSnapshot,
  deleteSessionById,
  listSavedSessions,
  loadSessionIntoStores,
  restoreLastSession,
  saveCurrentSession,
  saveSessionSnapshot,
  startNewSession,
} from '../src/services/sessionService.ts'
import { getSession } from '../src/services/sessionRepository.ts'
import { getLastSessionId } from '../src/services/settingsRepository.ts'
import { DEFAULT_APP_SETTINGS } from '../src/services/settingsTypes.ts'
import { sessionSignature } from '../src/store/sessionSnapshot.ts'
import { usePointsStore } from '../src/store/usePointsStore.ts'
import { usePolygonStore } from '../src/store/usePolygonStore.ts'
import { useSessionStore } from '../src/store/useSessionStore.ts'
import { useSettingsStore } from '../src/store/useSettingsStore.ts'

const point: GeoPoint = {
  id: 'p1',
  lat: 24.7136,
  lon: 46.6753,
  source: 'manual',
  createdAt: new Date('2026-10-20T08:00:00.000Z'),
}

function resetStores(): void {
  usePointsStore.setState({
    points: [],
    selectedPointId: null,
    selectedSegmentIndex: null,
  })
  usePolygonStore.setState({ vertices: [], status: 'idle' })
  useSettingsStore.getState().hydrate({ ...DEFAULT_APP_SETTINGS })
  useSessionStore.setState({ fitAllToken: 0 })
  useSessionStore.getState().reset()
}

describe('تنسيق الجلسات بين المتاجر وDexie', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    resetStores()
  })

  afterAll(async () => {
    await db.delete()
  })

  it('يحفظ الحالة الحالية وينشئ آخر جلسة', async () => {
    usePointsStore.getState().addPoint(point)
    usePolygonStore.getState().replacePolygon(
      [
        { id: 'v1', lat: 24.6, lon: 46.6 },
        { id: 'v2', lat: 24.7, lon: 46.7 },
        { id: 'v3', lat: 24.8, lon: 46.8 },
      ],
      true,
    )
    useSettingsStore.getState().hydrate({
      distanceUnit: 'mi',
      areaUnit: 'acre',
      coordinateFormat: 'MGRS',
    })

    const saved = await saveCurrentSession('جلسة الرياض')

    expect(saved.name).toBe('جلسة الرياض')
    expect(useSessionStore.getState().id).toBe(saved.id)
    expect(await getLastSessionId()).toBe(saved.id)
    expect((await listSavedSessions())[0].pointCount).toBe(1)
  })

  it('يحفظ لقطة محدثة ويستعيدها في المتاجر مع طلب التأطير', async () => {
    usePointsStore.getState().addPoint(point)
    const saved = await saveCurrentSession('جلسة')

    usePointsStore.getState().updatePoint('p1', { label: 'الرياض' })
    const snapshot = captureSessionSnapshot()
    await saveSessionSnapshot({
      id: saved.id,
      name: 'جلسة',
      snapshot,
      signature: sessionSignature(snapshot),
    })

    await startNewSession()
    expect(usePointsStore.getState().points).toHaveLength(0)
    expect(useSessionStore.getState().id).toBeNull()
    expect(await getLastSessionId()).toBeNull()

    const tokenBefore = useSessionStore.getState().fitAllToken
    const loaded = await loadSessionIntoStores(saved.id)

    expect(loaded).not.toBeNull()
    expect(usePointsStore.getState().points[0].label).toBe('الرياض')
    expect(useSessionStore.getState().id).toBe(saved.id)
    expect(useSessionStore.getState().fitAllToken).toBeGreaterThan(tokenBefore)
    expect(await getLastSessionId()).toBe(saved.id)
  })

  it('يستعيد آخر جلسة عند الإقلاع بعد إعادة التحميل', async () => {
    usePointsStore.getState().addPoint(point)
    await saveCurrentSession('آخر جلسة')

    // محاكاة إعادة تحميل الصفحة: المتاجر فارغة لكن lastSessionId محفوظ.
    usePointsStore.getState().replacePoints([])
    usePolygonStore.getState().clear()
    useSessionStore.getState().reset()

    expect(await restoreLastSession()).toBe(true)
    expect(usePointsStore.getState().points).toHaveLength(1)
    expect(useSessionStore.getState().name).toBe('آخر جلسة')
  })

  it('لا يحدّث حالة جلسة أخرى عند حفظ لقطة متأخرة', async () => {
    usePointsStore.getState().addPoint(point)
    const savedA = await saveCurrentSession('أ')

    await startNewSession()
    usePointsStore.getState().addPoint({ ...point, id: 'p2' })
    const savedB = await saveCurrentSession('ب')
    const storeBefore = useSessionStore.getState()
    const recordA = await getSession(savedA.id)

    await saveSessionSnapshot({
      id: savedA.id,
      name: recordA!.name,
      snapshot: {
        points: recordA!.points,
        polygon: recordA!.polygon,
        settings: recordA!.settings,
      },
      signature: 'stale-signature',
    })

    expect(useSessionStore.getState().id).toBe(savedB.id)
    expect(useSessionStore.getState().lastSavedSignature).toBe(
      storeBefore.lastSavedSignature,
    )
  })

  it('يحذف الجلسة الحالية ويفرغ مساحة العمل', async () => {
    usePointsStore.getState().addPoint(point)
    const saved = await saveCurrentSession('للحذف')

    expect(await deleteSessionById(saved.id)).toBe(true)
    expect(await getSession(saved.id)).toBeNull()
    expect(useSessionStore.getState().id).toBeNull()
    expect(usePointsStore.getState().points).toHaveLength(0)
    expect(await getLastSessionId()).toBeNull()
  })
})
