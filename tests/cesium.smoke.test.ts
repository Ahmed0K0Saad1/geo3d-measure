import { describe, expect, it } from 'vitest'
import { Ellipsoid } from 'cesium'

/**
 * اختبار دخان (Smoke Test) — غرضه الوحيد:
 *   1) إثبات أن حزمة Cesium قابلة للاستيراد والتشغيل في بيئة Node (بيئة التشغيل هنا).
 *   2) تثبيت ثابتَي WGS84 المرجعيين اللذين ستُبنى عليهما الوحدات القادمة.
 *
 * ⚠️ هذا الاختبار لا يثبت — ولا يدّعي — صحة أي وظيفة قياس (مسافات/اتجاهات/مساحات)؛
 *    فهذه لم تُنفَّذ بعد (تبدأ في P3) ولكل منها اختباراته المرجعية الموثقة عند تنفيذها.
 *
 * المصدر المرجعي للثوابت: WGS84 — NIMA TR8350.2 (الإهليلج الجيوديسي العالمي):
 *   a = 6378137.0 م · f = 1/298.257223563 · b = a(1−f) ≈ 6356752.314245179 م
 */
describe('Cesium smoke — توفر الحزمة وثوابت WGS84 (ليس اختبار قياس)', () => {
  it('يستورد Cesium في Node ويوفّر كائن Ellipsoid وفيه WGS84', () => {
    expect(Ellipsoid).toBeDefined()
    expect(Ellipsoid.WGS84).toBeDefined()
  })

  it('نصف المحور الأكبر a = 6378137 م (قيمة مضبوطة لا تقريبية)', () => {
    expect(Ellipsoid.WGS84.maximumRadius).toBe(6378137)
  })

  it('نصف المحور الأصغر b ≈ 6356752.314245179 م (مقارنة تقريبية toBeCloseTo)', () => {
    expect(Ellipsoid.WGS84.minimumRadius).toBeCloseTo(6356752.314245179, 6)
  })
})
