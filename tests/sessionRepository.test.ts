import 'fake-indexeddb/auto'
import { beforeEach, afterAll, describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import { db } from '../src/lib/dexie.ts'
import {
  deleteSession,
  getSession,
  listSessions,
  saveSession,
  SessionRepositoryError,
} from '../src/services/sessionRepository.ts'
import {
  getLastSessionId,
  loadAppSettings,
  saveAppSettings,
  SettingsRepositoryError,
  setLastSessionId,
} from '../src/services/settingsRepository.ts'
import { DEFAULT_APP_SETTINGS } from '../src/services/settingsTypes.ts'
import type {
  SessionRecord,
  SessionSnapshot,
} from '../src/services/sessionTypes.ts'

const point: GeoPoint = {
  id: 'p1',
  lat: 24.7136,
  lon: 46.6753,
  source: 'manual',
  createdAt: new Date('2026-10-20T08:00:00.000Z'),
}

const snapshot: SessionSnapshot = {
  points: [point],
  polygon: {
    vertices: [
      { id: 'v1', lat: 24.6, lon: 46.6 },
      { id: 'v2', lat: 24.7, lon: 46.7 },
      { id: 'v3', lat: 24.8, lon: 46.8 },
    ],
    closed: true,
  },
  settings: {
    distanceUnit: 'km',
    areaUnit: 'ha',
    coordinateFormat: 'DD',
  },
}

async function resetDatabase(): Promise<void> {
  await db.delete()
  await db.open()
}

describe('Repository الجلسات والإعدادات (Dexie)', () => {
  beforeEach(resetDatabase)

  afterAll(async () => {
    await db.delete()
  })

  it('يحفظ الجلسة ويستعيدها ويحدثها مع الحفاظ على createdAt', async () => {
    const saved = await saveSession({
      id: 's1',
      name: 'الرياض',
      snapshot,
    })
    expect(saved.version).toBe(1)
    expect(saved.createdAt).toBeInstanceOf(Date)

    const loaded = await getSession('s1')
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe('الرياض')
    expect(loaded!.points[0].lat).toBe(24.7136)
    expect(loaded!.polygon.closed).toBe(true)

    const updated = await saveSession({
      id: 's1',
      name: 'الرياض المعدلة',
      snapshot: {
        ...snapshot,
        points: [{ ...point, label: 'نقطة الرياض' }],
      },
    })
    expect(updated.createdAt.getTime()).toBe(saved.createdAt.getTime())
    expect(updated.name).toBe('الرياض المعدلة')
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      saved.updatedAt.getTime(),
    )
  })

  it('يبقي السجلات بعد إغلاق القاعدة وإعادة فتحها', async () => {
    await saveSession({ id: 's1', name: 'ثابتة', snapshot })
    await setLastSessionId('s1')

    db.close()
    await db.open()

    expect((await getSession('s1'))!.name).toBe('ثابتة')
    expect(await getLastSessionId()).toBe('s1')
  })

  it('يسرد الجلسات ويمنع الاسم الفارغ ويحذف', async () => {
    await saveSession({ id: 's1', name: 'أولى', snapshot })
    await saveSession({ id: 's2', name: 'ثانية', snapshot })

    const list = await listSessions()
    expect(list.map((item) => item.id).sort()).toEqual(['s1', 's2'])
    expect(list[0].pointCount).toBe(1)

    await expect(
      saveSession({ id: 's3', name: '   ', snapshot }),
    ).rejects.toMatchObject({ code: 'invalid-name' })
    expect(await deleteSession('s2')).toBe(true)
    expect(await deleteSession('s2')).toBe(false)
    expect(await getSession('s2')).toBeNull()
  })

  it('يرفض سجل جلسة تالفًا بدل تمريره للواجهة', async () => {
    await db.sessions.put({
      id: 'bad',
      name: 'تالفة',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      points: [{ id: 'x' }],
      polygon: { vertices: [], closed: false },
      settings: {
        distanceUnit: 'km',
        areaUnit: 'ha',
        coordinateFormat: 'DD',
      },
    } as unknown as SessionRecord)

    await expect(getSession('bad')).rejects.toBeInstanceOf(
      SessionRepositoryError,
    )
    await expect(getSession('bad')).rejects.toMatchObject({
      code: 'invalid-session',
    })
  })

  it('يحمّل الإعدادات الافتراضية ويحفظها ويحافظ على آخر جلسة', async () => {
    expect(await loadAppSettings()).toEqual(DEFAULT_APP_SETTINGS)

    await saveAppSettings({
      distanceUnit: 'mi',
      areaUnit: 'acre',
      coordinateFormat: 'MGRS',
    })
    expect(await loadAppSettings()).toMatchObject({
      distanceUnit: 'mi',
      areaUnit: 'acre',
      coordinateFormat: 'MGRS',
    })

    await setLastSessionId('s1')
    expect(await getLastSessionId()).toBe('s1')
    await saveAppSettings({
      distanceUnit: 'ft',
      areaUnit: 'ft2',
      coordinateFormat: 'DMS',
    })
    expect(await getLastSessionId()).toBe('s1')
  })

  it('يرفض إعدادات تالفة', async () => {
    await db.settings.put({
      key: 'app',
      distanceUnit: 'parsec',
      areaUnit: 'ha',
      coordinateFormat: 'DD',
      lastSessionId: null,
      updatedAt: new Date(),
    } as never)

    await expect(loadAppSettings()).rejects.toBeInstanceOf(
      SettingsRepositoryError,
    )
  })
})
