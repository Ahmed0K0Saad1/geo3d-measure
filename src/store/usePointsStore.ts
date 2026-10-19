import { create } from 'zustand'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'

/** حالة مخزن النقاط (T2.1 — مواصفة المالك). */
interface PointsState {
  points: GeoPoint[]
  addPoint: (point: GeoPoint) => void
  removePoint: (id: string) => void
  updatePoint: (id: string, updates: Partial<GeoPoint>) => void
  reorderPoints: (ids: string[]) => void
  selectPoint: (id: string | null) => void
  selectedPointId: string | null
}

/**
 * مخزن النقاط المركزي — كل طرق الإدخال في P2 تصب فيه،
 * وكيانات Cesium تُشتق منه عبر effect مركزي (ARCHITECTURE §5).
 */
export const usePointsStore = create<PointsState>()((set) => ({
  points: [],
  selectedPointId: null,
  addPoint: (point) => set((state) => ({ points: [...state.points, point] })),
  removePoint: (id) =>
    set((state) => ({ points: state.points.filter((p) => p.id !== id) })),
  updatePoint: (id, updates) =>
    set((state) => ({
      points: state.points.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  reorderPoints: (ids) =>
    set((state) => ({
      points: ids
        .map((id) => state.points.find((p) => p.id === id))
        .filter((p): p is GeoPoint => p !== undefined),
    })),
  selectPoint: (id) => set({ selectedPointId: id }),
}))
