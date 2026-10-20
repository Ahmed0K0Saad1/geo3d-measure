import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_APP_SETTINGS } from '../src/services/settingsTypes.ts'
import { useSettingsStore } from '../src/store/useSettingsStore.ts'

function reset(): void {
  useSettingsStore.getState().hydrate({ ...DEFAULT_APP_SETTINGS })
}

describe('مخزن الإعدادات', () => {
  beforeEach(reset)

  it('يبدأ بالقيم الافتراضية km/ha/DD', () => {
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_APP_SETTINGS)
  })

  it('يحدّث كل إعداد على حدة', () => {
    const store = useSettingsStore.getState()
    store.setDistanceUnit('mi')
    store.setAreaUnit('acre')
    store.setCoordinateFormat('MGRS')

    expect(useSettingsStore.getState()).toMatchObject({
      distanceUnit: 'mi',
      areaUnit: 'acre',
      coordinateFormat: 'MGRS',
    })
  })

  it('يستبدل الإعدادات كاملة عند استعادة جلسة', () => {
    useSettingsStore.getState().hydrate({
      distanceUnit: 'ft',
      areaUnit: 'ft2',
      coordinateFormat: 'DMS',
    })

    expect(useSettingsStore.getState()).toMatchObject({
      distanceUnit: 'ft',
      areaUnit: 'ft2',
      coordinateFormat: 'DMS',
    })
  })
})
