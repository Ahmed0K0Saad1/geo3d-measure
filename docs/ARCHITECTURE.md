# ARCHITECTURE.md — التصميم التقني

> المرجع التقني الرسمي. أي مخالفة تحتاج قرارًا جديدًا (ADR).

## 1) نظرة عامة (الطبقات)

```
┌─────────────────────── طبقة الواجهة (React) ──────────────────────────┐
│  Header (لغة/وحدات)   Sidebar (أدوات الإدخال)   Panels (نتائج/مساحة)  │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ Actions / Selectors
┌───────────────────────────────▼───────────────────────────────────────┐
│  إدارة الحالة — Zustand Store                                         │
│  points[] · segments/totals · polygon · settings · ui                 │
└───────────────┬───────────────────────────────┬───────────────────────┘
                │ مزامنة كيانات                 │ استدعاء الحسابات
┌───────────────▼─────────────┐   ┌─────────────▼────────────────────────┐
│  طبقة Cesium (تكامل فقط)    │   │  النواة الجغرافية Core (منطق خالص)   │
│  useCesiumViewer · كيانات   │   │  geo/ المسافات والاتجاهات والمساحة   │
│  FlyTo · Layers             │   │  coords/ DD·DMS·UTM·MGRS             │
│                             │   │  units/ التحويل والعرض               │
└───────────────┬─────────────┘   └──────────────────────────────────────┘
                │                               │
      [Esri + ion: صور · تسميات · تضاريس]   [Services: geocoding · storage · export]
```

**مبادئ معمارية:**
1. **Core نقي:** لا React ولا Cesium داخل `src/core` — قابل للاختبار في Node مباشرة.
2. **اتجاه واحد للمزامنة:** Cesium لا يقرأ من الـStore مباشرة، بل عبر effect مركزي يحدّث الكيانات.
3. **كل تكامل خارجي خلف واجهة** (خرائط/بحث/تخزين) لتسهيل الاستبدال والتوسعة.

## 2) خريطة المكتبات
| الحزمة | الغرض | البدائل المدروسة | الحالة |
|---|---|---|---|
| cesium | الكرة الأرضية 3D | MapLibre / Mapbox / Google | معتمد (ADR-001) |
| react + typescript + vite | الواجهة والبناء | Next.js | معتمد (ADR-002) |
| zustand | إدارة الحالة | Context API | معتمد (ADR-012 ✅) |
| dexie | IndexedDB | idb / LocalStorage | معتمد (ADR-013/035) |
| proj4 + mgrs | تحويلات UTM/MGRS | حسابات يدوية | معتمد (ADR-015 ✅ · T2.4) |
| zod | تحقق مدخلات الإحداثيات | Joi / Yup | معتمد (T2.4 · ADR-027) |
| i18next + react-i18next | التعريب | حل مخصص | معتمد (ADR-004) |
| vitest | الاختبارات | Jest | معتمد (ADR-016/019) |
| oxlint + prettier | جودة الكود | eslint + typescript-eslint | معتمد (ADR-019) |
| geographiclib-geodesic | مساحة جيوديسية دقيقة | تنفيذ ذاتي | معتمد (ADR-017/034) |
| axe-core + jsdom + Testing Library | اختبار الإتاحة | فحص يدوي فقط | معتمد (ADR-036) |
| vite-plugin-static-copy | نسخ أصول Cesium | استيراد مباشر | معتمد (ADR-011) |

## 3) شجرة الملفات الفعلية (v1.0)
```
geo3d-measure/
├─ docs/                     # STATE · ROADMAP · REQUIREMENTS · ARCHITECTURE
│                            # DECISIONS · USER_GUIDE · DEPLOYMENT · PRE_LAUNCH_CHECKLIST
├─ public/                   # أصول ثابتة
├─ src/
│  ├─ app/App.tsx            # تركيب التطبيق + lazy(MapView)
│  ├─ components/            # Header · Sidebar · LayerSelector
│  ├─ features/
│  │  ├─ map/                # useCesiumViewer · MapView · MapLoading · layerState/layerSources
│  │  │                      # usePointEntities/Hover · usePathEntities · usePolygonDraw/Entities
│  │  │                      # useFlyTo · useMapClick · pinImage · pathGeometry
│  │  ├─ points/             # PointsTools · ManualPointInput · GeocodingSearch
│  │  │                      # PointsPanel · ResultsPanel · useGeolocation · useGeocoding
│  │  ├─ polygon/            # PolygonTools · AreaComparison · areaFormat
│  │  ├─ sessions/           # SessionManager · useSessionPersistence
│  │  ├─ export/             # ExportPanel
│  │  └─ settings/           # SettingsPanel
│  ├─ core/                  # منطق نقي بلا React/Cesium
│  │  ├─ geo/                # GeoPoint · haversine · path · strategy/registry · areaGeodesic/areaUtm
│  │  ├─ coords/             # parsers · utm · mgrs · formatPoint
│  │  └─ units/              # unitTypes · converters · areaConverters
│  ├─ services/              # geocoding · session/settings repositories+services · exportFormat/Service
│  ├─ store/                 # Zustand: usePointsStore · usePolygonStore · useSessionStore
│  │                         # useSettingsStore · sessionSnapshot
│  ├─ i18n/                  # i18n.ts · ar.json · en.json
│  ├─ lib/                   # dexie · validators · ids · collections
│  └─ types/env.d.ts
├─ tests/                    # Vitest + fixtures + accessibility.test.tsx + e2e/manual-scenarios.md
├─ .env.example · .gitignore · AGENTS.md · README.md · vercel.json (T7.5)
```

## 4) محرك القياس (قلب المشروع)

### 4.1 العقد التصميمي (وصف، ليس كودًا نهائيًا)
```ts
interface DistanceStrategy {
  id: string;            // 'haversine' (v1) | 'vincenty' | 'karney' (توسعة مستقبلية)
  labelKey: string;      // مفتاح ترجمة لاسم المنهجية المعروض (FR-14)
  compute(a: GeoPoint, b: GeoPoint): SegmentResult;
}
interface SegmentResult {
  meters: number;
  initialBearingDeg: number;
  finalBearingDeg: number;
  method: string;        // يُعرض في الواجهة للشفافية
}
```
- **Registry:** تسجيل الاستراتيجيات بمفتاح؛ الواجهة تختار عبر إعداد. v1 يسجّل Haversine فقط.
- **فصل المسؤوليات:** الاستراتيجية تتعامل مع الإحداثيات فقط؛ الوحدات تُدار خارجها في `units/`.

### 4.2 حساب المساحة
- `areaGeodesic(points)`: عبر GeographicLib `PolygonArea` (دقة إهليلجية) و`Compute(false, true)` ثم `Math.abs` — التوقيع ضروري لأن `sign=false` تعيد متممة المساحة عند عكس اتجاه اللف (ADR-034). الارتفاع مهمَل والقياس على سطح WGS84.
- `areaUtm(points)`: منطقة واحدة تؤخذ من centroid عبر `utmZoneFor`، ثم إسقاط كل الرؤوس بـ`wgs84ToUtmInZone` (بلا تحقق Easting/Northing) وShoelace. تحذير `multi-zone` عند الامتداد، وإيقاف UTM مع سبب عند خط التاريخ أو نصفَي الكرة أو خارج 80°S–84°N.
- الواجهة (`AreaComparison`) تعرض القيمتين + الفرق الموقّع + شرح تشوه الإسقاط + التحذيرات، بوحدات m²/ha/km²/ft²/acre/mi² (الافتراضي هكتار).

### 4.3 سياسة الدقة المعروضة
- كل نتيجة تحمل شارة المنهجية: "Haversine — WGS84 كروي تقريبي".
- توثيق الفرق النظري حتى ~0.5% مقارنة بالإهليلجي داخل الواجهة والتوثيق.

## 5) تكامل Cesium
- `useCesiumViewer(container, layerState)`: يدير دورة الحياة (إنشاء/تدمير العارض) ويطبّق حالة الطبقات — بلا إعادة إنشاء العارض.
- مزامنة الكيانات: effect مركزي يقرأ الـStore ويحدّث EntityCollection (نقاط/خطوط/مضلع) — بدون إعادة إنشاء العارض.
- التركيز على نقطة: `PointsPanel` لا يلمس Cesium؛ يرفع `FlyToRequest` إلى `App` ويستهلكه `useFlyTo` داخل `MapView` (ADR-030). في P4 يكتشف `useFlyTo` النقطة المضافة بمقارنة المعرّفات ويؤطّرها مع السابقة تلقائيًا (ADR-033).
- النقاط (T4.1): `usePointEntities` يرسم `Billboard` من SVG Data URI (`pinImage.ts`) بلون ورقم؛ النقاط بلا ارتفاع تُثبَّت على التضاريس، والتلميح عبر `usePointHover` + `PointTooltip` (HTML overlay) لا عبر `Entity.description`.
- المسار (T4.2): `usePathEntities` يرسم `Polyline` جيوديسية مثبَّتة على الأرض لكل مقطع؛ المقطع المحدد (`selectedSegmentIndex`) أحمر والبقية زرقاء.
- المضلع (T5.1): الحالة في `usePolygonStore` (`idle/drawing/closed` + رؤوس). `usePolygonDraw` يدير `LEFT_CLICK`/`MOUSE_MOVE` وEscape ويغلق بالنقر على الرأس الأول ضمن 16px أو بالزر؛ `usePolygonEntities` يرسم الرؤوس والخط المغلق والتعبئة وخط المعاينة المتقطع. وضع النقر ووضع المضلع متعارضان في `App`.
- النتائج (T4.3): `ResultsPanel` يحسب `computePath` في الواجهة ويعرض المقاطع والاتجاهين والإجمالي واسم المنهجية، مع وحدات m/km/mi/ft/nm من `useSettingsStore` (T6.4).
- الجلسات (T6.2): `useSessionPersistence` يحمّل الإعدادات وآخر جلسة عند الإقلاع، ويحفظ الجلسة تلقائيًا بعد أول حفظ صريح (debounce 800ms). `useFlyTo` يتلقى `fitAllToken` ويؤطّر البيانات المستعادة بـ`frameAll` (bbox مع خط التاريخ)، ويتجاهل الإضافة الجماعية لتفادي طيرانين.
- الإعدادات والتصدير (T6.3/T6.4): `useSettingsStore` مصدر مركزي للوحدات وصيغة الإحداثيات؛ `formatPoint` ينسّق DD/DMS/UTM/MGRS مع fallback إلى DMS. التصدير عبر مُسلسلات نقية (`exportFormat.ts`) وتنزيل المتصفح في `exportService.ts`.
- التضاريس من Cesium ion عبر `VITE_CESIUM_ION_TOKEN`؛ خريطة أساس واحدة من ثلاث Esri (World Imagery / Street Map / Topo Map — بلا مفتاح، ADR-020/022)؛ تسميات شفافة اختيارية من Esri World_Boundaries_and_Places فوقها (ADR-021).
- مبدّل الطبقات المخصص `LayerSelector` (الشريط العلوي): اختيار خريطة الأساس (radio) + إظهار/إخفاء التسميات والتضاريس (checkbox)؛ الحالة في React ويطبّقها `useCesiumViewer` (تبديل متزامن + كاش تضاريس + `errorEvent` لكل طبقة). مصادر الطبقات مركزية في `features/map/layerSources.ts` (ADR-022).
- رسم المسار: Polyline (يتبع سطح الأرض بسلوك Cesium الافتراضي للخطوط الجيوديسية).
- **الأداء (T7.2 — ADR-037):** `MapView` يُحمَّل بـ`lazy()` + `Suspense` مع `MapLoading`؛ التقسيم عبر `build.rolldownOptions.output.codeSplitting.groups` (cesium/react/i18n/vendor)؛ `LayerState` في `layerState.ts` بلا Cesium حتى لا يعود إلى حزمة الدخول. Cesium غير موجود في `index.html` أو `modulepreload`.
- **الموبايل والإتاحة (T7.3):** breakpoint 768px يقلب التخطيط إلى عمود (الخريطة 50dvh أولًا) مع `100dvh` وfallback، وأهداف لمس ≥40px؛ `:focus-visible` و`.visually-hidden` موحّدان؛ الخريطة `role="region"` + `aria-label` مترجم + `aria-describedby` لتلميح لوحة المفاتيح (الإدخال اليدوي).

## 6) Geocoding
- الواجهة: `GeocodingProvider { search(query, { signal }): Promise<GeocodingResult[]> }` في `services/geocoding.ts`.
- v1: Nominatim مع debounce 600ms وكاش ومعالجة 429 وإسناد OpenStreetMap الظاهر (ADR-029).
- بديل جاهز للتبديل: Photon (بدون تغييرات في الواجهة الأمامية).

## 7) التخزين المحلي
- Dexie، قاعدة `geo3d-measure`، مخطط v1 (ADR-035):
  - `sessions`: `{ id, name, createdAt, updatedAt, version: 1, points[], polygon: { vertices[], closed }, settings: { distanceUnit, areaUnit, coordinateFormat } }` — المفهرس `id, updatedAt`.
  - `settings`: `{ key: 'app', distanceUnit, areaUnit, coordinateFormat, lastSessionId, updatedAt }` — المفتاح `key`.
- اللغة تبقى في `localStorage` (`geo3d.lang`) للتهيئة الفورية، ولا تُخزَّن في لقطة الجلسة؛ الكاميرا والتحديدات خارج اللقطة أيضًا.
- Repository: `listSessions/getSession/saveSession/deleteSession` + `loadAppSettings/saveAppSettings/getLastSessionId/setLastSessionId` مع تحقق zod وأخطاء مرمزة — يمكن استبداله لاحقًا بـHTTP دون تغيير الواجهة (ADR-005).
- الجلسة تُحفظ كلقطة (`points` + `polygon` + `settings`)؛ الاستعادة تملأ المتاجر ثم تطلب تأطيرًا واحدًا لكل البيانات.

## 8) i18n و RTL
- i18next + react-i18next، ملفات `ar.json`/`en.json`، تبديل `dir` تلقائيًا.
- تنسيق الأرقام يتبع اللغة؛ نسخ الإحداثيات يكون دائمًا بالصيغة الدولية الموحدة.
- صيغة الإحداثيات المعروضة (DD/DMS/UTM/MGRS) ووحدات المسافة/المساحة إعدادات مركزية محفوظة في Dexie؛ التغيير ينعكس فورًا على لوحة النتائج ومقارنة المساحة وقائمة النقاط والتلميح.

## 9) استراتيجية الاختبارات
1. **وحدة (Vitest):** `core/` و`coords/` و`units/` بدون متصفح.
2. **مرجعية:** fixtures تُولَّد بـGeographicLib (مسافات/مساحات لمَواقع معيارية) وتُحفظ JSON في `tests/fixtures`.
3. **حدود نظرية:** اختبار أن فرق Haversine عن المرجع الإهليلجي داخل الحد الأقصى المتوقع.
4. **يدوي موثق:** سيناريوهات لكل مرحلة تُكتب في STATE و`tests/e2e/manual-scenarios.md`.
5. **إتاحة (Vitest + jsdom):** `axe-core` على Header + Sidebar في AR/RTL وEN/LTR بوسوم WCAG A/AA؛ `color-contrast` وCesium يُفحصان يدويًا لغياب التخطيط/WebGL في jsdom (ADR-036).
6. **تغطية:** `npm run test:coverage` (v8) بلا عتبات إجبارية؛ القياس مرجعي لتحديد الفجوات.

## 10) المخاطر التقنية
مرجع R-1..R-5 في `ROADMAP.md`؛ التفاصيل الإضافية تُضاف هنا عند معالجتها.

## 11) البناء والنشر
- **البناء:** `tsc -b && vite build`؛ الناتج `dist/` مع `dist/cesiumStatic/` (Assets/Workers/Widgets) المنسوخة بواسطة `vite-plugin-static-copy`.
- **التقسيم:** مجموعات Rolldown (cesium/react/i18n/vendor) + `MapView` كسول؛ الهدف إبقاء الدخول < 300KB gzip.
- **البيئة:** `VITE_CESIUM_ION_TOKEN` يُضمَّن وقت البناء (عام بطبيعته)؛ لا أسرار في `VITE_*`.
- **الاستضافة:** Vercel (معتمد) أو Nginx. التطبيق بلا Router، فلا يحتاج rewrite عامًا.
- **الرؤوس:** `Permissions-Policy: geolocation=(self)`، `X-Content-Type-Options`، `X-Frame-Options`، `Referrer-Policy`، وكاش طويل لأصول `/assets` المبصومة وقصير لـ`/cesiumStatic`.
- التفاصيل التنفيذية والتحقق والتراجع في `DEPLOYMENT.md`، وقائمة القبول في `PRE_LAUNCH_CHECKLIST.md`.
