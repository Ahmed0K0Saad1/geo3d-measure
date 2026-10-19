import { Ellipsoid } from 'cesium'

// سطر تحقق T1.2 — يُستبدل بالكرة الأرضية في T1.5
// (WGS84 نصف المحور الأكبر ثابت جيوديسي معروف: 6378137 م)
const wgs84SemiMajorAxis = Ellipsoid.WGS84.maximumRadius

export default function App() {
  return (
    <main>
      <h1>Geo3D Measure</h1>
      <p>بسم الله الرحمن الرحيم</p>
      <p>تحقق T1.2: استيراد Cesium يعمل ✓</p>
      <p>
        WGS84 نصف المحور الأكبر = {wgs84SemiMajorAxis} م (سطر مؤقت — يُستبدل
        بالكرة الأرضية في T1.5)
      </p>
    </main>
  )
}
