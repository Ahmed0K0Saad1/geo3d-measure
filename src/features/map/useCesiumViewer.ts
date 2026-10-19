import { useEffect, useRef, type RefObject } from 'react'
import {
  ArcGisMapServerImageryProvider,
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  ImageryLayer,
  Ion,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN

if (!ionToken) {
  throw new Error(
    'VITE_CESIUM_ION_TOKEN مفقود: انسخ .env.example إلى .env وضع التوكن ثم أعد تشغيل الخادم',
  )
}

Ion.defaultAccessToken = ionToken

/**
 * الصور الأساسية: Esri World Imagery (ADR-020) — بديل صور ion الافتراضية
 * التي تُوجَّه إلى Bing Maps المتقاعدة (HTTP 401).
 */
const ESRI_WORLD_IMAGERY_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'

/** تسميات المدن والحدود (شفافة) فوق الصور — بديل تسميات Bing المتقاعد (ADR-021). */
const ESRI_LABELS_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer'

/** حالة إظهار الطبقات الثلاث — يحتفظ بها React ويُطبّقها هذا الخطاف. */
export interface LayerVisibility {
  imagery: boolean
  labels: boolean
  terrain: boolean
}

/** الوضع الابتدائي: الطبقات الثلاث العاملة مفعّلة. */
export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  imagery: true,
  labels: true,
  terrain: true,
}

/** كاش على مستوى الوحدة: التضاريس تُجلب من ion مرة واحدة وتُعاد عند الطلب. */
let worldTerrainPromise: Promise<CesiumTerrainProvider> | null = null

function getWorldTerrain(): Promise<CesiumTerrainProvider> {
  // World Terrain = أصل ion رقم 1 (وهو ما يجلبـه Terrain.fromWorldTerrain داخلياً)
  worldTerrainPromise ??= CesiumTerrainProvider.fromIonAssetId(1)
  return worldTerrainPromise
}

/**
 * يدير دورة حياة Cesium Viewer داخل حاوية React (انظر ARCHITECTURE §5):
 * يُنشئ العارض مرة واحدة، ثم يطبّق حالة إظهار الطبقات عند كل تغيير.
 * آمن مع StrictMode في React 19.
 */
export function useCesiumViewer(
  containerRef: RefObject<HTMLDivElement | null>,
  layerVisibility: LayerVisibility,
): void {
  const viewerRef = useRef<Viewer | null>(null)
  const baseLayerRef = useRef<ImageryLayer | null>(null)
  const labelsLayerRef = useRef<ImageryLayer | null>(null)
  const flatTerrainRef = useRef<EllipsoidTerrainProvider | null>(null)
  const terrainWantedRef = useRef(false)

  // (1) الإنشاء مرة واحدة لكل حاوية
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const baseLayer = ImageryLayer.fromProviderAsync(
      ArcGisMapServerImageryProvider.fromUrl(ESRI_WORLD_IMAGERY_URL),
    )
    // تسجيل واضح لأخطاء الطبقة بدل الفشل الصامت
    baseLayer.errorEvent.addEventListener((error) => {
      console.error('[Geo3D] فشل تحميل طبقة الصور:', error)
    })

    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      // المدمجة تبقى معطلة — بديلها المخصص LayerSelector (ADR-020 + ADR-021)
      baseLayerPicker: false,
      baseLayer,
    })

    viewerRef.current = viewer
    baseLayerRef.current = baseLayer

    return () => {
      viewer.destroy()
      viewerRef.current = null
      baseLayerRef.current = null
      labelsLayerRef.current = null
    }
  }, [containerRef])

  // (2) تطبيق حالة الإظهار — يعمل أيضاً للوضع الابتدائي بعد الإنشاء
  useEffect(() => {
    const viewer = viewerRef.current
    const baseLayer = baseLayerRef.current
    if (!viewer || !baseLayer) {
      return
    }

    terrainWantedRef.current = layerVisibility.terrain
    baseLayer.show = layerVisibility.imagery

    // طبقة التسميات: تُنشأ عند أول تفعيل ثم تُظهَر/تُخفى دون إعادة تحميل
    const labelsLayer = labelsLayerRef.current
    if (layerVisibility.labels) {
      if (labelsLayer === null) {
        const createdLayer = ImageryLayer.fromProviderAsync(
          ArcGisMapServerImageryProvider.fromUrl(ESRI_LABELS_URL),
        )
        createdLayer.errorEvent.addEventListener((error) => {
          console.error('[Geo3D] فشل تحميل طبقة التسميات:', error)
        })
        viewer.imageryLayers.add(createdLayer)
        labelsLayerRef.current = createdLayer
      } else {
        labelsLayer.show = true
      }
    } else if (labelsLayer !== null) {
      labelsLayer.show = false
    }

    // التضاريس: تبديل بين World Terrain (ion) وشكل أرضي مستوٍ
    if (layerVisibility.terrain) {
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
  }, [layerVisibility])
}
