import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  ArcGisMapServerImageryProvider,
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  ImageryLayer,
  Ion,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  BASE_LAYER_SOURCES,
  LABELS_SOURCE_URL,
  WORLD_TERRAIN_ASSET_ID,
  type BaseLayerId,
} from './layerSources'
import type { LayerState } from './layerState'

const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN

if (!ionToken) {
  throw new Error(
    'VITE_CESIUM_ION_TOKEN مفقود: انسخ .env.example إلى .env وضع التوكن ثم أعد تشغيل الخادم',
  )
}

Ion.defaultAccessToken = ionToken

/** كاش على مستوى الوحدة: التضاريس تُجلب من ion مرة واحدة وتُعاد عند الطلب. */
let worldTerrainPromise: Promise<CesiumTerrainProvider> | null = null

function getWorldTerrain(): Promise<CesiumTerrainProvider> {
  worldTerrainPromise ??= CesiumTerrainProvider.fromIonAssetId(
    WORLD_TERRAIN_ASSET_ID,
  )
  return worldTerrainPromise
}

/** يُنشئ طبقة Esri مع سجل أخطاء واضح خاص بها (معالجة فردية لكل طبقة). */
function createEsriLayer(url: string, errorLabel: string): ImageryLayer {
  const layer = ImageryLayer.fromProviderAsync(
    ArcGisMapServerImageryProvider.fromUrl(url),
  )
  layer.errorEvent.addEventListener((error) => {
    console.error(errorLabel, error)
  })
  return layer
}

/**
 * يدير دورة حياة Cesium Viewer داخل حاوية React (انظر ARCHITECTURE §5):
 * يُنشئ العارض مرة واحدة، ثم يطبّق حالة الطبقات عند كل تغيير.
 * آمن مع StrictMode في React 19.
 */
export function useCesiumViewer(
  containerRef: RefObject<HTMLDivElement | null>,
  layerState: LayerState,
): Viewer | null {
  const viewerRef = useRef<Viewer | null>(null)
  const [activeViewer, setActiveViewer] = useState<Viewer | null>(null)
  const baseLayerRef = useRef<ImageryLayer | null>(null)
  const appliedBaseIdRef = useRef<BaseLayerId | null>(null)
  const labelsLayerRef = useRef<ImageryLayer | null>(null)
  const flatTerrainRef = useRef<EllipsoidTerrainProvider | null>(null)
  const terrainWantedRef = useRef(false)

  // (1) الإنشاء مرة واحدة لكل حاوية — الطبقات تُضاف عبر تأثير الحالة أدناه
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      // المدمجة تبقى معطلة — بديلها المخصص LayerSelector (ADR-020/021/022)
      baseLayerPicker: false,
      baseLayer: false,
    })

    viewerRef.current = viewer
    setActiveViewer(viewer)

    return () => {
      viewer.destroy()
      viewerRef.current = null
      setActiveViewer(null)
      baseLayerRef.current = null
      appliedBaseIdRef.current = null
      labelsLayerRef.current = null
    }
  }, [containerRef])

  // (2) تطبيق حالة الطبقات — يشمل الوضع الابتدائي بعد الإنشاء
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) {
      return
    }

    // الخريطة الأساسية: تبديل متزامن — إزالة السابقة وتدميرها ثم إضافة الجديدة في الأسفل
    if (
      appliedBaseIdRef.current !== layerState.baseLayer ||
      baseLayerRef.current === null
    ) {
      const previousLayer = baseLayerRef.current
      if (previousLayer !== null) {
        viewer.imageryLayers.remove(previousLayer, true)
      }
      const nextLayer = createEsriLayer(
        BASE_LAYER_SOURCES[layerState.baseLayer],
        '[Geo3D] فشل تحميل الخريطة الأساسية:',
      )
      viewer.imageryLayers.add(nextLayer, 0)
      baseLayerRef.current = nextLayer
      appliedBaseIdRef.current = layerState.baseLayer
    }

    // طبقة التسميات: تُنشأ عند أول تفعيل ثم تُظهَر/تُخفى دون إعادة تحميل
    const labelsLayer = labelsLayerRef.current
    if (layerState.labels) {
      if (labelsLayer === null) {
        const createdLayer = createEsriLayer(
          LABELS_SOURCE_URL,
          '[Geo3D] فشل تحميل طبقة التسميات:',
        )
        viewer.imageryLayers.add(createdLayer)
        labelsLayerRef.current = createdLayer
      } else {
        labelsLayer.show = true
      }
    } else if (labelsLayer !== null) {
      labelsLayer.show = false
    }

    // التضاريس: تبديل بين World Terrain (ion) وشكل أرضي مستوٍ
    terrainWantedRef.current = layerState.terrain
    if (layerState.terrain) {
      void getWorldTerrain()
        .then((terrainProvider) => {
          if (terrainWantedRef.current && viewerRef.current === viewer) {
            viewer.terrainProvider = terrainProvider
          }
        })
        .catch((error: unknown) => {
          worldTerrainPromise = null // اسمح بإعادة المحاولة عند تفعيل لاحق
          console.error('[Geo3D] فشل تحميل التضاريس:', error)
        })
    } else {
      const flatTerrain = (flatTerrainRef.current ??=
        new EllipsoidTerrainProvider())
      viewer.terrainProvider = flatTerrain
    }
  }, [layerState])

  return activeViewer
}
