import { useState } from 'react'
import { Header } from '@/components/Header'
import { LayerSelector } from '@/components/LayerSelector'
import { Sidebar } from '@/components/Sidebar'
import { MapView } from '@/features/map/MapView'
import {
  DEFAULT_LAYER_VISIBILITY,
  type LayerVisibility,
} from '@/features/map/useCesiumViewer'

export default function App() {
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(
    DEFAULT_LAYER_VISIBILITY,
  )

  const toggleLayer = (key: keyof LayerVisibility): void => {
    setLayerVisibility((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <div className="app-shell">
      <Header>
        <LayerSelector visibility={layerVisibility} onToggle={toggleLayer} />
      </Header>
      <div className="app-body">
        <Sidebar />
        <MapView layerVisibility={layerVisibility} />
      </div>
    </div>
  )
}
