import { beforeEach, describe, expect, it } from 'vitest'
import { usePolygonStore } from '../src/store/usePolygonStore.ts'

function reset(): void {
  usePolygonStore.setState({ vertices: [], status: 'idle' })
}

describe('مخزن المضلع', () => {
  beforeEach(reset)

  it('يضيف الرؤوس ويولّد معرفات ويدخل حالة الرسم', () => {
    const store = usePolygonStore.getState()
    store.addVertex({ lat: 24.6, lon: 46.6 })
    store.addVertex({ lat: 24.7, lon: 46.7 })

    const state = usePolygonStore.getState()
    expect(state.vertices).toHaveLength(2)
    expect(state.vertices[0].id).toMatch(/^polygon-/)
    expect(state.status).toBe('drawing')
  })

  it('يغلق عند ثلاثة رؤوس فقط', () => {
    const store = usePolygonStore.getState()
    store.addVertex({ lat: 24.6, lon: 46.6 })
    store.addVertex({ lat: 24.7, lon: 46.7 })
    store.close()
    expect(usePolygonStore.getState().status).toBe('drawing')

    usePolygonStore.getState().addVertex({ lat: 24.8, lon: 46.8 })
    usePolygonStore.getState().close()
    expect(usePolygonStore.getState().status).toBe('closed')
  })

  it('يتراجع عن آخر رأس ويعود للرسم عند تعديل مضلع مغلق', () => {
    const store = usePolygonStore.getState()
    store.addVertex({ lat: 24.6, lon: 46.6 })
    store.addVertex({ lat: 24.7, lon: 46.7 })
    store.addVertex({ lat: 24.8, lon: 46.8 })
    store.close()

    usePolygonStore.getState().undoVertex()
    const state = usePolygonStore.getState()
    expect(state.vertices).toHaveLength(2)
    expect(state.status).toBe('drawing')
  })

  it('يمسح كل الرؤوس ويعيد الحالة الابتدائية', () => {
    const store = usePolygonStore.getState()
    store.addVertex({ lat: 24.6, lon: 46.6 })
    store.clear()
    expect(usePolygonStore.getState()).toMatchObject({
      vertices: [],
      status: 'idle',
    })
  })

  it('يستبدل المضلع من جلسة محفوظة', () => {
    usePolygonStore.getState().replacePolygon(
      [
        { id: 'a', lat: 24.6, lon: 46.6 },
        { id: 'b', lat: 24.7, lon: 46.7 },
        { id: 'c', lat: 24.8, lon: 46.8 },
      ],
      true,
    )
    expect(usePolygonStore.getState().status).toBe('closed')

    usePolygonStore.getState().replacePolygon([], false)
    expect(usePolygonStore.getState()).toMatchObject({
      vertices: [],
      status: 'idle',
    })
  })
})
