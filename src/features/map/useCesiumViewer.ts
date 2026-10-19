import { useEffect, type RefObject } from 'react'
import {
  ArcGisMapServerImageryProvider,
  ImageryLayer,
  Ion,
  Terrain,
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
 * الصور الأساسية: Esri World Imagery عبر خدمة REST الكلاسيكية المجانية بلا مفتاح
 * (ADR-020) — بديلاً لصور ion الافتراضية التي تُوجَّه إلى Bing Maps المتقاعدة (404).
 */
const ESRI_WORLD_IMAGERY_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'

/**
 * يدير دورة حياة Cesium Viewer داخل حاوية React (انظر ARCHITECTURE §5).
 * يُنشئ العارض مرة واحدة ويدمّره عند الإزالة — آمن مع StrictMode في React 19.
 */
export function useCesiumViewer(
  containerRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const baseLayer = ImageryLayer.fromProviderAsync(
      ArcGisMapServerImageryProvider.fromUrl(ESRI_WORLD_IMAGERY_URL),
    )
    // تسجيل واضح لأخطاء طبقة الصور بدل الفشل الصامت
    baseLayer.errorEvent.addEventListener((error) => {
      console.error('[Geo3D] فشل تحميل طبقة الصور:', error)
    })

    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      // أُوقفت القائمة الافتراضية: كانت تختار Bing المتقاعد تلقائياً (ADR-020)
      baseLayerPicker: false,
      baseLayer,
      terrain: Terrain.fromWorldTerrain(),
    })

    return () => {
      viewer.destroy()
    }
  }, [containerRef])
}
