import { create } from 'zustand'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'

/** حالة مخزن النقاط (T2.1 — مواصفة المالك؛ توسعة P4). */
interface PointsState {
  points: GeoPoint[]
  selectedPointId: string | null
  /** فهرس المقطع المحدد (0-based) — T4.2/ADR-033. */
  selectedSegmentIndex: number | null
  addPoint: (point: GeoPoint) => void
  removePoint: (id: string) => void
  updatePoint: (id: string, updates: Partial<GeoPoint>) => void
  reorderPoints: (ids: string[]) => void
  selectPoint: (id: string | null) => void
  selectSegment: (index: number | null) => void
}

/** عدد المقاطع المتاح بعدد النقاط الحالي. */
function segmentsFor(pointCount: number): number {
  return Math.max(0, pointCount - 1)
}

/**
 * مخزن النقاط المركزي — كل طرق الإدخال في P2 تصب فيه،
 * وكيانات Cesium تُشتق منه عبر effect مركزي (ARCHITECTURE §5).
 */
export const usePointsStore = create<PointsState>()((set) => ({
  points: [],
  selectedPointId: null,
  selectedSegmentIndex: null,
  addPoint: (point) => set((state) => ({ points: [...state.points, point] })),
  removePoint: (id) =>
    set((state) => {
      const points = state.points.filter((p) => p.id !== id)
      const segmentCount = segmentsFor(points.length)
      return {
        points,
        // حذف نقطة يغيّر فهارس المقاطع؛ لا تُبقِ اختيارًا خارج النطاق.
        selectedSegmentIndex:
          state.selectedSegmentIndex !== null &&
          state.selectedSegmentIndex >= segmentCount
            ? null
            : state.selectedSegmentIndex,
      }
    }),
  updatePoint: (id, updates) =>
    set((state) => ({
      points: state.points.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  reorderPoints: (ids) =>
    set((state) => ({
      points: ids
        .map((id) => state.points.find((p) => p.id === id))
        .filter((p): p is GeoPoint => p !== undefined),
      // الترتيب يعيد تعريف المقاطع، فيُصفَّر الاختيار بدل الإشارة لفهرس قديم.
      selectedSegmentIndex: null,
    })),
  selectPoint: (id) => set({ selectedPointId: id }),
  selectSegment: (index) => set({ selectedSegmentIndex: index }),
}))
