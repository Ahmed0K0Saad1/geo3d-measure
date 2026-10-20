/**
 * مخططات الجلسة المحفوظة (T6.1 — ADR-035):
 * تحقق zod واحد يخدم الحفظ والتحميل ويمنع سجلات تالفة من الوصول للمتاجر.
 */

import { z } from 'zod'
import { geoPointSchema } from '@/lib/validators.ts'
import { appSettingsSchema } from './settingsTypes.ts'

export const polygonVertexSchema = z.object({
  id: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  height: z.number().optional(),
})

export const sessionPolygonSchema = z.object({
  vertices: z.array(polygonVertexSchema),
  closed: z.boolean(),
})

export const sessionSnapshotSchema = z.object({
  points: z.array(geoPointSchema),
  polygon: sessionPolygonSchema,
  settings: appSettingsSchema,
})

export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>
export type SessionPolygon = z.infer<typeof sessionPolygonSchema>
export type SessionVertex = z.infer<typeof polygonVertexSchema>

export const sessionRecordSchema = sessionSnapshotSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.literal(1),
})

export type SessionRecord = z.infer<typeof sessionRecordSchema>

export interface SessionSummary {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  pointCount: number
}

export interface SaveSessionInput {
  id: string
  name: string
  snapshot: SessionSnapshot
}
