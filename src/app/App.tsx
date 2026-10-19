import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { MapView } from '@/features/map/MapView'

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar />
        <MapView />
      </div>
    </div>
  )
}
