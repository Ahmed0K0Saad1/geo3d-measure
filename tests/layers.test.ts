import { describe, expect, it } from 'vitest'
import {
  BASE_LAYER_IDS,
  BASE_LAYER_SOURCES,
  LABELS_SOURCE_URL,
  WORLD_TERRAIN_ASSET_ID,
} from '../src/features/map/layerSources.ts'

const ESRI_REST_PREFIX =
  'https://services.arcgisonline.com/ArcGIS/rest/services/'

describe('مصادر الطبقات (layerSources)', () => {
  it('ثلاث خرائط أساس فقط، كلها Esri REST بلا Bing', () => {
    expect(BASE_LAYER_IDS).toEqual(['imagery', 'streets', 'topographic'])

    for (const id of BASE_LAYER_IDS) {
      const url = BASE_LAYER_SOURCES[id]
      expect(url.startsWith(ESRI_REST_PREFIX)).toBe(true)
      expect(url.toLowerCase()).not.toContain('virtualearth')
      expect(url.toLowerCase()).not.toContain('bing')
    }
  })

  it('التسميات من Esri والتضاريس من الأصل ion رقم 1', () => {
    expect(LABELS_SOURCE_URL.startsWith(ESRI_REST_PREFIX)).toBe(true)
    expect(LABELS_SOURCE_URL).toContain('World_Boundaries_and_Places')
    expect(WORLD_TERRAIN_ASSET_ID).toBe(1)
  })
})
