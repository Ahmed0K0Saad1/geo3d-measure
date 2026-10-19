/**
 * مخططات zod للتحقق من النقاط الجغرافية (T2.4).
 * تطابق نموذج GeoPoint المعتمد (ADR-023/025) — كيان كامل + مسودة إدخال.
 */

import { z } from 'zod'

/** مصادر إدخال النقطة المعتمدة في النموذج. */
export const coordinateSourceSchema = z.enum([
  'gps',
  'manual',
  'utm',
  'mgrs',
  'click',
  'geocoding',
])

/** مسودة إحداثية قبل توليد الهوية ووقت الإنشاء. */
export const geoPointDraftSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  height: z.number().optional(),
  accuracy: z.number().nonnegative().optional(),
  label: z.string().optional(),
  source: coordinateSourceSchema,
})

/** كيان GeoPoint الكامل كما يُخزَّن في المتجر. */
export const geoPointSchema = geoPointDraftSchema.extend({
  id: z.string().min(1),
  createdAt: z.date(),
})

export type GeoPointDraft = z.infer<typeof geoPointDraftSchema>
export type GeoPointEntity = z.infer<typeof geoPointSchema>
