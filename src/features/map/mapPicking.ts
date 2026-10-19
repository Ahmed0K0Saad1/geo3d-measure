/**
 * التقاط إحداثيات من الشاشة إلى سطح الكرة (T2.5).
 * منطق Cesium معزول عن React — قابل للاختبار في Node.
 */

import {
  Ellipsoid,
  Math as CesiumMath,
  type Cartesian2,
  type Cartesian3,
  type Viewer,
} from 'cesium'

/** إحداثيات نقطة ملتقطة من سطح الكرة (WGS84). */
export interface PickedCoordinates {
  lat: number
  lon: number
  /** الارتفاع عن سطح المجسم الإهليلجي بالمتر. */
  height: number
}

/** يحوّل نقطة Cesium الديكارتية إلى lat/lon/height (أو null لنقطة غير صالحة). */
export function cartesianToCoordinates(
  cartesian: Cartesian3,
  ellipsoid: Ellipsoid = Ellipsoid.WGS84,
): PickedCoordinates | null {
  const cartographic = ellipsoid.cartesianToCartographic(cartesian)
  if (!cartographic) {
    return null
  }
  return {
    lat: CesiumMath.toDegrees(cartographic.latitude),
    lon: CesiumMath.toDegrees(cartographic.longitude),
    height: cartographic.height,
  }
}

/**
 * يلتقط نقطة من موضع الشاشة:
 * `globe.pick` على السطح الفعلي، وعند غياب التضاريس/الفشل يعود إلى
 * `camera.pickEllipsoid` (سطح المجسم الإهليلجي — ارتفاع 0).
 */
export function pickGlobeCoordinates(
  viewer: Viewer,
  position: Cartesian2,
): PickedCoordinates | null {
  const ellipsoid = viewer.scene.globe.ellipsoid
  const ray = viewer.camera.getPickRay(position)

  if (ray) {
    const intersection = viewer.scene.globe.pick(ray, viewer.scene)
    if (intersection) {
      return cartesianToCoordinates(intersection, ellipsoid)
    }
  }

  const ellipsoidIntersection = viewer.camera.pickEllipsoid(position, ellipsoid)
  return ellipsoidIntersection
    ? cartesianToCoordinates(ellipsoidIntersection, ellipsoid)
    : null
}
