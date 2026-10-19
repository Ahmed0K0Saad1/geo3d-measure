/**
 * نموذج النقطة الجغرافية — كيان نقي مشترك (بلا React وبلا Cesium).
 * الإحداثيات بدرجات عشرية على WGS84 (بمواصفة المالك — T2.1).
 */
export interface GeoPoint {
  id: string
  /** خط العرض بدرجات (−90 إلى 90). */
  lat: number
  /** خط الطول بدرجات (−180 إلى 180). */
  lon: number
  /** الارتفاع عن سطح المجسم الإهليلجي بالمتر (اختياري). */
  height?: number
  /** هامش دقة GPS بالمتر — FR-1 (ADR-025). */
  accuracy?: number
  /** تسمية اختيارية تعرضها الواجهة. */
  label?: string
  /** مصدر إدخال النقطة. */
  source: 'gps' | 'manual' | 'utm' | 'mgrs' | 'click' | 'geocoding'
  /** وقت الإنشاء (يُولَّد عند المستدعي في هذه المرحلة). */
  createdAt: Date
}
