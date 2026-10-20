import { create } from 'zustand'

/** رأس مضلع مرسوم على الكرة (WGS84). */
export interface PolygonVertex {
  id: string
  lat: number
  lon: number
  /** ارتفاع اختياري من التقاط التضاريس؛ لا يدخل في حساب المساحة. */
  height?: number
}

export type PolygonStatus = 'idle' | 'drawing' | 'closed'

export type NewPolygonVertex = Omit<PolygonVertex, 'id'> & { id?: string }

interface PolygonState {
  vertices: PolygonVertex[]
  status: PolygonStatus
  startDrawing: () => void
  stopDrawing: () => void
  addVertex: (vertex: NewPolygonVertex) => void
  undoVertex: () => void
  close: () => void
  clear: () => void
  replacePolygon: (vertices: PolygonVertex[], closed: boolean) => void
}

function createVertexId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `polygon-${crypto.randomUUID()}`
  }
  return `polygon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * مخزن المضلع الواحد في P5 (ADR-034):
 * الرؤوس مشتركة بين الرسم والمساحة والتصدير والجلسات.
 */
export const usePolygonStore = create<PolygonState>()((set) => ({
  vertices: [],
  status: 'idle',
  startDrawing: () => set({ status: 'drawing' }),
  stopDrawing: () => set({ status: 'idle' }),
  addVertex: (vertex) =>
    set((state) => ({
      vertices: [
        ...state.vertices,
        { ...vertex, id: vertex.id ?? createVertexId() },
      ],
      status: 'drawing',
    })),
  undoVertex: () =>
    set((state) => {
      const vertices = state.vertices.slice(0, -1)
      return {
        vertices,
        status:
          vertices.length === 0
            ? 'idle'
            : state.status === 'closed'
              ? 'drawing'
              : state.status,
      }
    }),
  close: () =>
    set((state) =>
      state.vertices.length >= 3
        ? { status: 'closed' }
        : { status: state.status },
    ),
  clear: () => set({ vertices: [], status: 'idle' }),
  replacePolygon: (vertices, closed) =>
    set({
      vertices,
      status: closed && vertices.length >= 3 ? 'closed' : 'idle',
    }),
}))
