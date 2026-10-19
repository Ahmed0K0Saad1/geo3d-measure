/**
 * مصدر الحقيقة الوحيد لمصادر الطبقات (ADR-020/021/022).
 * كل الخرائط الأساسية من Esri REST الكلاسيكية — مجانية بلا مفتاح.
 * تحقق حي (2026-10-20): metadata 200 + بلاطة 200 + CORS `*` للجميع.
 */

/** معرّفات الخرائط الأساسية المتاحة. */
export type BaseLayerId = 'imagery' | 'streets' | 'topographic'

/** ترتيب العرض في قائمة الطبقات. */
export const BASE_LAYER_IDS: BaseLayerId[] = [
  'imagery',
  'streets',
  'topographic',
]

/** عناوين ArcGIS REST لكل خريطة أساس. */
export const BASE_LAYER_SOURCES: Record<BaseLayerId, string> = {
  imagery:
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
  streets:
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
  topographic:
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
}

/** تسميات المدن والحدود (شفافة) — تُعرض فوق أي خريطة أساس. */
export const LABELS_SOURCE_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer'

/** World Terrain في Cesium ion (معرّف الأصل الثابت). */
export const WORLD_TERRAIN_ASSET_ID = 1
