import { useCallback, useState } from 'react'
import { Header } from '@/components/Header'
import { LayerSelector } from '@/components/LayerSelector'
import { Sidebar } from '@/components/Sidebar'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { MapView } from '@/features/map/MapView'
import type { BaseLayerId } from '@/features/map/layerSources'
import type { FlyToRequest } from '@/features/map/useFlyTo'
import {
  DEFAULT_LAYER_STATE,
  type LayerState,
} from '@/features/map/useCesiumViewer'

export default function App() {
  const [layerState, setLayerState] = useState<LayerState>(DEFAULT_LAYER_STATE)
  const [isClickMode, setIsClickMode] = useState(false)
  const [isPolygonMode, setIsPolygonMode] = useState(false)
  const [flyToRequest, setFlyToRequest] = useState<FlyToRequest | null>(null)

  const changeBaseLayer = (baseLayer: BaseLayerId): void => {
    setLayerState((current) => ({ ...current, baseLayer }))
  }

  const toggleLayer = (key: 'labels' | 'terrain'): void => {
    setLayerState((current) => ({ ...current, [key]: !current[key] }))
  }

  const toggleClickMode = useCallback((): void => {
    setIsClickMode((current) => !current)
    setIsPolygonMode(false)
  }, [])

  const endClickMode = useCallback((): void => {
    setIsClickMode(false)
  }, [])

  const togglePolygonMode = useCallback((): void => {
    setIsPolygonMode((current) => !current)
    setIsClickMode(false)
  }, [])

  const endPolygonMode = useCallback((): void => {
    setIsPolygonMode(false)
  }, [])

  const focusPoint = useCallback((point: GeoPoint): void => {
    setFlyToRequest({
      lat: point.lat,
      lon: point.lon,
      height: point.height,
    })
  }, [])

  return (
    <div className="app-shell">
      <Header>
        <LayerSelector
          state={layerState}
          onBaseLayerChange={changeBaseLayer}
          onToggle={toggleLayer}
        />
      </Header>
      <div className="app-body">
        <Sidebar
          isClickMode={isClickMode}
          onToggleClickMode={toggleClickMode}
          isPolygonMode={isPolygonMode}
          onTogglePolygonMode={togglePolygonMode}
          onFocusPoint={focusPoint}
        />
        <MapView
          layerState={layerState}
          isClickMode={isClickMode}
          onClickModeEnd={endClickMode}
          isPolygonMode={isPolygonMode}
          onPolygonModeEnd={endPolygonMode}
          flyToRequest={flyToRequest}
        />
      </div>
    </div>
  )
}
