import { create } from 'zustand'
import type { AreaUnit, DistanceUnit } from '@/core/units/unitTypes.ts'
import type { CoordinateFormat } from '@/core/coords/formatPoint.ts'
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from '@/services/settingsTypes.ts'

interface SettingsState extends AppSettings {
  setDistanceUnit: (unit: DistanceUnit) => void
  setAreaUnit: (unit: AreaUnit) => void
  setCoordinateFormat: (format: CoordinateFormat) => void
  hydrate: (settings: AppSettings) => void
}

/**
 * إعدادات العرض المركزية (T6.4 — ADR-035):
 * لوحة المسار والمقارنة والإحداثيات تقرأ منها بدل حالات محلية متفرقة.
 */
export const useSettingsStore = create<SettingsState>()((set) => ({
  ...DEFAULT_APP_SETTINGS,
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),
  setAreaUnit: (areaUnit) => set({ areaUnit }),
  setCoordinateFormat: (coordinateFormat) => set({ coordinateFormat }),
  hydrate: (settings) => set(settings),
}))
