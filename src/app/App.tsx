import { useState } from 'react'
import { Header } from '@/components/Header'
import { LayerSelector } from '@/components/LayerSelector'
import { Sidebar } from '@/components/Sidebar'
import { MapView } from '@/features/map/MapView'
import type { BaseLayerId } from '@/features/map/layerSources'
import {
  DEFAULT_LAYER_STATE,
  type LayerState,
} from '@/features/map/useCesiumViewer'

export default function App() {
  const [layerState, setLayerState] = useState<LayerState>(DEFAULT_LAYER_STATE)

  const changeBaseLayer = (baseLayer: BaseLayerId): void => {
    setLayerState((current) => ({ ...current, baseLayer }))
  }

  const toggleLayer = (key: 'labels' | 'terrain'): void => {
    setLayerState((current) => ({ ...current, [key]: !current[key] }))
  }

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
        <Sidebar />
        <MapView layerState={layerState} />
      </div>
    </div>
  )
}
