/**
 * عقد استراتيجية المسافة — منطق نقي في `core/geo`.
 * المرجع: ADR-003 · ADR-032 · ARCHITECTURE §4.1.
 */
import type { GeoPoint } from './GeoPoint.ts'

/** نتيجة قياس مقطع واحد. */
export interface SegmentResult {
  /** المسافة بالمتر على سطح المجسم/الكرة (بلا أثر للارتفاع). */
  meters: number
  /** الاتجاه الابتدائي من a إلى b بالدرجات، في المجال [0, 360). */
  initialBearingDeg: number
  /** الاتجاه النهائي عند b بالدرجات، في المجال [0, 360). */
  finalBearingDeg: number
  /** معرّف المنهجية المستخدمة — للشفافية (FR-14). */
  method: string
}

/** استراتيجية حساب مسافة واتجاه مقطع. */
export interface DistanceStrategy {
  readonly id: string
  /** مفتاح ترجمة اسم المنهجية المعروض في الواجهة (FR-14). */
  readonly labelKey: string
  compute(a: GeoPoint, b: GeoPoint): SegmentResult
}

/** سجل استراتيجيات المسافة — يسمح بالتبديل عبر الإعداد. */
export interface DistanceStrategyRegistry {
  register(strategy: DistanceStrategy): void
  get(id: string): DistanceStrategy | undefined
  list(): DistanceStrategy[]
}
