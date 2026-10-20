import type { BaseLayerId } from './layerSources'

/**
 * حالة الطبقات — كيان React نقي بلا Cesium (T7.2).
 * فصله عن `useCesiumViewer` يمنع سحب Cesium إلى حزمة الدخول
 * عندما يقرأ `App` الحالة الابتدائية قبل تحميل الخريطة كسولًا.
 */
export interface LayerState {
  baseLayer: BaseLayerId
  labels: boolean
  terrain: boolean
}

/** الوضع الابتدائي: صور + تسميات + تضاريس. */
export const DEFAULT_LAYER_STATE: LayerState = {
  baseLayer: 'imagery',
  labels: true,
  terrain: true,
}
