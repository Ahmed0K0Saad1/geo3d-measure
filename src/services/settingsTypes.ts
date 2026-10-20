/**
 * أنواع الإعدادات المشتركة بين المتجر وDexie — منطق تحقق نقي (T6.4).
 */

import { z } from 'zod'
import { AREA_UNITS, DISTANCE_UNITS } from '@/core/units/unitTypes.ts'
import { COORDINATE_FORMATS } from '@/core/coords/formatPoint.ts'

export const appSettingsSchema = z.object({
  distanceUnit: z.enum(DISTANCE_UNITS),
  areaUnit: z.enum(AREA_UNITS),
  coordinateFormat: z.enum(COORDINATE_FORMATS),
})

export type AppSettings = z.infer<typeof appSettingsSchema>

export const DEFAULT_APP_SETTINGS: AppSettings = {
  distanceUnit: 'km',
  areaUnit: 'ha',
  coordinateFormat: 'DD',
}

export const appSettingsRecordSchema = appSettingsSchema.extend({
  key: z.literal('app'),
  lastSessionId: z.string().min(1).nullable(),
  updatedAt: z.date(),
})

export type AppSettingsRecord = z.infer<typeof appSettingsRecordSchema>
