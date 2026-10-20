/** نقطة جغرافية دنيا كافية لحساب المساحة (بلا React/Cesium). */
export interface AreaPoint {
  lat: number
  lon: number
}

/** نتيجة مساحة تحمل مفتاح منهجية قابلًا للترجمة (FR-14). */
export interface AreaResultBase {
  /** محيط المضلع بالمتر. */
  perimeterMeters: number
  /** مفتاح ترجمة اسم المنهجية. */
  methodKey: string
}
