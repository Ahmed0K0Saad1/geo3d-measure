# ROADMAP.md — خطة العمل (WBS)

> تُدار المهام بأرقام: `P` = مرحلة، `T` = مهمة. **دليل الرموز:** ☐ لم تبدأ · ⏳ جارية · ☑ مكتملة · 🔒 بوابة اعتماد. **الحجم:** S قصيرة / M متوسطة / L كبيرة.
> كل مرحلة تُفصَّل خطواتها تفصيلًا كاملًا وتُعتمد من المالك **قبل** الدخول إليها (Iterative Elaboration).

## نظرة المراحل
| المرحلة | الهدف | بوابة الخروج (DoD) | الحالة |
|---|---|---|---|
| P0 التأسيس والتوثيق | مشروع منظم + توثيق حي | اعتماد المالك للوثيقة (T0.3) | ☑ |
| P1 التهيئة التقنية | تطبيق يعمل بكرة أرضية 3D | يعمل محليًا بتضاريس وواجهة AR/EN | ☑ |
| P2 إدخال النقاط | كل طرق إدخال المواقع | نقطة تُدخل بأي طريقة وتظهر على الكرة | ☑ (فحوص بصرية A-2..A-7 معلّقة) |
| P3 محرك القياس | مسافات واتجاهات موثقة الدقة | نتائج مطابقة للمراجع بهامش موثق | ☑ |
| P4 العرض البصري | تجربة القياس على الكرة | أضف نقطتين ← ترى المسافة على الكرة ولوحة النتائج | ☑ (فحص بصري A-8 معلّق) |
| P5 المضلع والمساحة | مساحة بطريقتين مع مقارنة | مضلع مرسوم + مساحتان مع تفسير الفرق | ☐ |
| P6 الحفظ والتصدير | استمرارية العمل | جلسة تُحفظ وتُستعاد وتُصدَّر (GeoJSON/KML/CSV) | ☐ |
| P7 الجودة والإطلاق | جهوزية v1.0 | نسخة مجتازة للاختبارات وجاهزة/منشورة | ☐ |

---

## P0 — التأسيس والتوثيق (الجلسة 1)
- [x] **T0.1 — مجلد المشروع + تهيئة Git** `S` ☑ — المجلد `D:\geo3d-measure`، فرع `main`.
- [x] **T0.2 — نظام التوثيق + أول التزام** `M` ☑ — 9 ملفات: README / AGENTS / .gitignore / .env.example / docs×5.
- [x] 🔒 **T0.3 — بوابة الاعتماد:** اعتمد المالك الوثائق والانتقال إلى P1 (الجلسة 2 — 2026-10-19). ☑

**قيود متفق عليها:** لا كود تشغيلي قبل الاعتماد · كل قرار مرقّم ADR · كل خطوة تُشرح قبل تنفيذها.

---

## P1 — التهيئة التقنية (Scaffold)
> بوابة الدخول: اكتمال T0.3. (الخطوات التفصيلية أدناه نهائية وتُنفَّذ كما هي بعد اعتمادها.)

- [x] **T1.1 — تهيئة مشروع Vite + React + TS** `S` ☑ — نُفِّذت على القرص دون توثيق، ثم وُثّقت والتُزمت في الجلسة 2 (Vite 8.3 · React 19.2 · TS 6 صارم · alias `@/` · Oxlint) — تحقق: lint نظيف + build ناجح.
  1. إنشاء المشروع بقالب `react-ts` داخل المجلد الحالي (مع الحفاظ على ملفات التوثيق).
  2. تفعيل `strict` في tsconfig + alias `@/` ← `src/`.
  3. تنظيف ملفات القالب الافتراضية.
  4. تحقق: `npm run dev` يفتح صفحة نظيفة بدون أخطاء.
- [x] **T1.2 — دمج Cesium مع Vite** `M` ☑
  - التثبيت: `cesium@1.146.0` + `vite-plugin-static-copy@4.1.1`.
  - المقارنة: رُفض `vite-plugin-cesium` (غير محدّث منذ 2024، عصر Vite 3) واعتُمد الإعداد الرسمي CesiumGS (التفاصيل: ADR-011).
  - التحقق: lint نظيف · build ناجح (342 أصلاً في `dist/cesiumStatic/`) · الأصول تُخدَم في dev (HTTP 200) · استيراد Cesium يعمل في الواجهة (سطر تحقق مؤقت).
- [x] **T1.3 — طبقة الجودة الأساسية** `S` ☑ — Oxlint (بدل ESLint — ADR-019) + Prettier + Vitest: اختبار دخان لثوابت WGS84 (ليس اختبار قياس) — تحقق: lint نظيف · format:check نظيف · test 3/3 · build ناجح.
- [x] **T1.4 — هيكل المجلدات النهائي** `S` ☑ — أُنشئت الشجرة المعتمدة (15 مجلداً + `.gitkeep`) ونُقل `App.tsx` إلى `src/app/` مع استيراد `@/` في `main.tsx` — تحقق: lint نظيف · format:check نظيف · test 3/3 · build ناجح (بنفس بصمة الحزمة — صفر تغيير سلوكي).
- [x] **T1.5 — التوكن + أول كرة أرضية حقيقية** `S` ☑ — `.env` محلي آمن (خارج Git، مُتحقق HTTP 200) + `useCesiumViewer` (World Terrain من ion + صور Esri World Imagery — ADR-020) + App full-screen — تحقق: lint · format:check · test 3/3 · build · dev-server 200 — اعتمد المالك الالتزام (الفحص البصري النهائي يُستكمل مع فحص T1.6).
  1. وضع التوكن في `.env` محليًا. 2. تحميل World Terrain + الصور الأساسية. 3. تحقق بصري: دوران/تقريب/تضاريس واضحة.
- [x] **T1.6 — الهيكل العام للواجهة + i18n أولي** `M` ☑ — Header (مبدّل AR/EN فوري + وحدات placeholder) + Sidebar (أدوات مستقبلية معطلة) + MapView · i18next + react-i18next مع `ar.json`/`en.json` + مزامنة lang/dir (RTL↔LTR) + اختبار تطابق المفاتيح — تحقق: lint · format:check · test 4/4 · build · dev-server 200 — الالتزام: `feat(ui): initial shell layout with AR/EN i18n (T1.6)`.
  1. Header (اللغة/الوحدات) + Sidebar (منطقة الأدوات) + Map (تملأ الباقي).
  2. إعداد react-i18next مع `ar.json`/`en.json` + تبديل RTL/LTR فوري.
- [x] **T1.7 — مبدّل الطبقات المخصص (LayerSelector)** `M` ☑ — **مع توسعتها (جلسة 8):** 3 خرائط أساس Esri واحدة-من-ثلاث (Imagery / Street Map / Topo Map — radio) + تسميات Esri شفافة + ion World Terrain · `layerSources.ts` مصدر حقيقة واحد للثوابت · قائمة منسدلة في الشريط العلوي بعناصر أصلية (radio/checkbox، RTL/LTR، إغلاق بنقرة خارجية/Escape) · حالة الطبقات في React والـhook يطبّقها (تبديل متزامن remove+add(0) + كاش تضاريس + `errorEvent` لكل طبقة) · مفاتيح `layers.*` الثمانية في ar/en — تحقق: lint · format:check · test 6/6 · build · dev-server 200 — الالتزامان: `feat(map): add custom layer selector with working Esri and ion layers` (T1.7) و`feat(map): extend layer selector with Esri base maps and ion terrain (T1.7 extension)` (ADR-021/022).

**DoD المرحلة P1:** تطبيق يعمل محليًا: كرة أرضية بتضاريس + واجهة بهويتين لغويتين + جودة كود مفعّلة + اختبار يمر — **☑ محقق (الجلسة 6).**

---

## P2 — إدخال النقاط (فُصِّلت واعتُمدت — 2026-10-20، الجلسة 9)
> كل طرق الإدخال تصب في قناة واحدة: مخزن Zustand المركزي. `core/` بلا React/Cesium، وكل النصوص عبر `ar.json`/`en.json` (اختبار التطابق يحرسها).

- [x] **T2.1 — نموذج النقطة + مخزن Zustand** `S` ☑ — بمواصفة المالك: `src/core/geo/GeoPoint.ts` (كيان نقي: id · lat · lon · height? · label? · source(gps|manual|utm|mgrs|click|geocoding) · createdAt) + `src/store/usePointsStore.ts` (zustand 5.0.15: add/remove/update/reorder/select + selectedPointId) + `tests/pointsStore.test.ts` (7 اختبارات بلا DOM) — مع تفعيل alias `@/` في إعداد Vitest ومشروع TS للاختبارات — تحقق: lint · format:check · test 13/13 · build.
- [x] **T2.2 — «موقعي الحالي» (GPS + أذونات + أخطاء)** `S` ☑ — `geolocation.ts` (تحويل نقي + أكواد أخطاء مترجمة) + `useGeolocation` (نداء واحد، enableHighAccuracy، مهلة 10s) + `PointsTools` في Sidebar (زر + انتظار + دقة ±م + رسائل مترجمة) + العرض الأولي على الكرة `usePointEntities` (علامة مرقّمة — ADR-024) + `useCesiumViewer` يعيد العارض + `accuracy` في النموذج (ADR-025) + مفاتيح `points.*` + 4 اختبارات — تحقق: lint · format:check · test 17/17 · build · dev-server 200.
- [x] **T2.3 — إدخال يدوي DD/DMS + معاينة فورية** `M` ☑ — `core/coords/parsers.ts` (`parseDD` · `parseDMS` · `parseCoordinate` محوري · `formatDD` · `formatDMS` — ADR-026) + `ManualPointInput` في أدوات النقاط (حقلان بمعاينة فورية DD↔DMS + إضافة `source: manual`) + مفاتيح `points.manual.*` + 15 اختبارًا بقيم مرجعية — تحقق: lint · format:check · test 32/32 · build · dev-server 200.
- [x] **T2.4 — إضافة UTM/MGRS (proj4js + mgrs + تحقق zod)** `M` ☑ — `core/coords/utm.ts` (`wgs84ToUtm` · `utmToWgs84` · `utmZoneFor` مع الحالات الخاصة · `formatUtm` · `UtmError`) · `core/coords/mgrs.ts` (`wgs84ToMgrs` · `mgrsToWgs84` عبر `toPoint` · `MgrsError`) · `lib/validators.ts` (`geoPointDraftSchema` + `geoPointSchema`) · توسيع `ManualPointInput` بمبدّل صيغ ومعاينة أربع صيغ ومصدر حسب الصيغة · 22 اختبارًا بقيم PROJ ومتجهات GEOTRANS (ADR-027) — تحقق: lint · format:check · test 54/54 · build · dev-server 200.
- [x] **T2.5 — وضع النقر على الخريطة لإضافة نقطة** `S` ☑ — زر وضع في `PointsTools` + حالة في `App` + `useMapClick` (`ScreenSpaceEventHandler` LEFT_CLICK · `mapPicking` عبر `globe.pick` وبديل `pickEllipsoid` · خروج بـEsc/بعد الإضافة · تنظيف كامل) + `source: click` + مؤشر crosshair + 3 اختبارات تحويل — تحقق: lint · format:check · test 57/57 · build · dev-server 200 (ADR-028).
- [x] **T2.6 — البحث بالاسم (Nominatim + debounce + قائمة نتائج)** `M` ☑ — `services/geocoding.ts` (`GeocodingProvider` — ADR-014) + تحقق zod من الاستجابة + كاش (50) + 429/شبكة/استجابة غير صالحة + إسناد OSM + `useGeocoding` (debounce 600ms · AbortController · تنظيف) + `GeocodingSearch` داخل PointsTools + نقطة `source: geocoding` + 7 اختبارات بلا شبكة — تحقق: lint · format:check · test 64/64 · build · dev-server 200 (ADR-029).
- [x] **T2.7 — لوحة قائمة النقاط (تسمية/حذف/ترتيب/تركيز)** `M` ☑ — `features/points/PointsPanel.tsx` (ترقيم 1..n · تسمية داخلية حفظ/إلغاء · حذف مع تصفير الاختيار · ترتيب أعلى/أسفل عبر `reorderPoints` · تركيز) + `useFlyTo` في MapView عبر `FlyToRequest` مرفوع إلى App + `lib/collections.ts` (`moveItem` نقية) + مفاتيح `points.panel.*` + 7 اختبارات — تحقق: lint · format:check · test 71/71 · build · dev-server 200 (ADR-030).

**DoD المرحلة:** أي طريقة إدخال ← النقطة تظهر مرقمة على الكرة وفي القائمة.
> ✅ P2 مغلقة بقرار المالك (2026-10-20 — 71/71 تقنيًا)؛ الفحوص اليدوية A-2..A-7 تبقى بنود قبول بصري معلّقة (ADR-031).

---

## P3 — محرك القياس (فُصِّلت واعتُمدت — 2026-10-20، الجلسة 16)
> منطق نقي في `src/core/**` بلا React/Cesium. الوحدات خارج الاستراتيجية، وكل النصوص عبر i18n (ADR-004). كل نتيجة تحمل `method` (FR-14). التفاصيل في ADR-032.

- [x] **T3.1 — عقد DistanceStrategy + Registry + نموذج النتيجة** `S`
  1. `src/core/geo/strategy.ts`: `SegmentResult` (`meters` · `initialBearingDeg` · `finalBearingDeg` · `method`) + `DistanceStrategy` (`id` · `labelKey` · `compute`) + `DistanceStrategyRegistry`.
  2. `src/core/geo/registry.ts`: `StrategyRegistry` بـ`Map`؛ آخر تسجيل لنفس `id` يفوز (موثّق).
  3. اختبارات: تسجيل/جلب/قائمة · معرّف غير موجود · تكرار `id`.
  - القبول: `import type` وامتدادات `.ts` · lint · format:check · test · build.
- [x] **T3.2 — استراتيجية Haversine + تحويل الوحدات** `S`
  1. `src/core/geo/haversine.ts`: نصف القطر `6371008.8` م (REQUIREMENTS §6) وتقييد `h` إلى `[0,1]` لتفادي `NaN` العائم.
  2. النقطة المطابقة (مسافة 0) ← الاتجاهان 0 لأن الاتجاه غير معرّف؛ الاتجاهات في `[0,360)`.
  3. `src/core/units/converters.ts`: دوال نقية فقط — m↔km · m↔nm (1852) · m↔mi (1609.344) · m↔ft (0.3048) — بلا نصوص واجهة (ADR-004/008).
  4. اختبارات تحويل ومسافات أساسية.
  - القبول: lint · format:check · test · build.
- [x] **T3.3 — الاتجاه الابتدائي/النهائي (Bearing)** `S`
  1. `initialBearing`/`finalBearing` داخل `haversine.ts`؛ `finalBearing = (initialBearing(b,a)+180) mod 360`.
  2. اختبارات: شرق/غرب/شمال/جنوب · خط التاريخ · الحالة المرجعية بكين→سان فرانسيسكو.
  - القبول: lint · format:check · test · build.
- [x] **T3.4 — تجميع المقاطع المتعددة + الإجمالي** `S`
  1. `src/core/geo/path.ts`: `computePath(points, strategy)` يقبل `DistanceStrategy`؛ 0/1 نقطة ← 0 مقاطع وإجمالي 0.
  2. اختبارات باستراتيجية ثابتة + Haversine.
  - القبول: lint · format:check · test · build.
- [x] **T3.5 — الاختبارات المرجعية والمقارنات** `M`
  1. `tests/fixtures/geodesic-reference.json` بقيم GeographicLib 2.1 WGS84: ويلينغتون→سالامانكا · بكين→سان فرانسيسكو.
  2. مسافة Haversine داخل 0.5% من المرجع الإهليلجي؛ اتجاهات الحالة المرجعية داخل 0.1°.
  3. توثيق المصدر والفرق المرصود في الاختبار وADR-032.
  - القبول: lint · format:check · test · build.

**DoD المرحلة:** كل نتيجة تحمل اسم المنهجية (FR-14) + اختبارات خضراء بمراجع موثقة.

> ✅ P3 مكتملة تقنيًا (2026-10-20 — 94/94): lint · format:check · build خضراء. الالتزام: `feat(measure): haversine engine with bearing, path aggregation, and reference tests (P3)` (ADR-032).

---

## P4 — العرض البصري على الكرة
> ✅ فُصِّلت واعتُمدت من المالك (2026-10-20 — الجلسة 17). القرارات: ADR-033.

- [x] **T4.1 — كيانات النقاط (Pin مرقّم + Tooltip)** `S`
  1. `src/features/map/pinImage.ts` (نقي): توليد SVG Data URI لدبوس بلون + رقم؛ لوحة 8 ألوان متناوبة حسب الترتيب (بلا أصول خارجية).
  2. `usePointEntities`: استبدال `point` بـ`Billboard` (`VerticalOrigin.BOTTOM`، الرقم داخل الصورة)؛ النقاط بلا `height` بـ`HeightReference.CLAMP_TO_GROUND` حتى لا تختفي تحت التضاريس؛ النقطة المختارة بحلقة بيضاء وتكبير خفيف.
  3. `usePointHover(viewer)` + `PointTooltip.tsx`: `MOUSE_MOVE` → `scene.pick` → HTML overlay (الرقم · التسمية · الإحداثيات) مثبَّت داخل الحاوية. لا `Entity.description` (لا يظهر عند التمرير، وخطر XSS من التسمية).
  4. اختبارات `pinImage` + تحديث أي اختبارات كيانات قائمة.
  - القبول: دبابيس مرقّمة ظاهرة فوق التضاريس · تلميح عند التمرير · تمييز المختار · lint · format:check · test · build.
- [x] **T4.2 — الخط الواصل بين النقاط + تمييز المقطع المحدد** `M`
  1. إضافة `selectedSegmentIndex` + `selectSegment()` إلى المخزن، وتصفيره عند الحذف/إعادة الترتيب (الفهارس تتغير).
  2. `src/features/map/pathGeometry.ts` (نقي): بناء مواقع المقطع + التحقق من صلاحية الفهرس؛ اختبارات.
  3. `usePathEntities(viewer)`: كيان `Polyline` لكل مقطع (`store-segment-{i}`) بـ`ArcType.GEODESIC` و`clampToGround: true`؛ العرض 3 أزرق، والمحدد 5 أحمر.
  4. دمج الهوك في `MapView`.
  - القبول: خط متصل بين النقاط · المقطع المحدد أحمر · يتحدث فورًا مع الإضافة/الحذف/الترتيب · lint · format:check · test · build.
- [x] **T4.3 — لوحة النتائج (مقاطع/إجمالي/اتجاهات + تبديل الوحدات)** `M`
  1. `src/features/points/resultsFormat.ts` (نقي): تحويل الوحدة (م/كم/ميل بحري) + عدد المنازل (م 1 · كم 3 · nm 3) + تنسيق الاتجاه؛ اختبارات.
  2. `ResultsPanel.tsx`: `useMemo(computePath(points, new HaversineStrategy()))`؛ جدول المقاطع (# · من → إلى · المسافة · الاتجاه الابتدائي · الاتجاه النهائي) + صف الإجمالي + اسم المنهجية (FR-14).
  3. صفوف الجدول أزرار: النقر يختار المقطع (`selectedSegmentIndex`) والنقر مرة أخرى يلغي.
  4. زر وحدات ثلاثي بـ`aria-pressed` (الافتراضي كم) + أرقام `dir="ltr"`؛ قسم مستقل في `Sidebar` بعد `PointsPanel` (لا داخل `PointsTools`).
  5. مفاتيح `results.*` في `ar.json`/`en.json`.
  - القبول: جدول حي مع كل تغيير · إجمالي صحيح · تبديل الوحدات يعمل · AR/EN · lint · format:check · test · build.
- [x] **T4.4 — FlyTo وتركيز الكاميرا** `S`
  1. دوال نقية في `useFlyTo.ts`: `detectAddedPoint` (بمقارنة المعرّفات — يتجاهل التعديل/الحذف/الترتيب وأول تحميل) + `framePoints` (منتصف جغرافي مع خط التاريخ + ارتفاع `max(2000, المسافة×1.2)`).
  2. تركيز تلقائي عند إضافة نقطة: تأطير النقطة الجديدة مع السابقة إن وُجدت، وإلا ارتفاع 2 كم.
  3. الإبقاء على `FlyToRequest` من قائمة النقاط بمدة 1.5s.
  4. توسيع `tests/flyTo.test.ts`.
  - القبول: تركيز تلقائي عند الإضافة (بلا طيران عند التعديل/الحذف/الترتيب) · تركيز من القائمة · lint · format:check · test · build.

**DoD المرحلة:** سيناريو كامل: موقعي + نقطة بحث ← الخط والمسافة يظهران لحظيًا، مع لوحة نتائج تعمل وتركيز كاميرا سليم.

> ✅ P4 مكتملة تقنيًا (2026-10-20 — 123/123): lint · format:check · build خضراء (1899 وحدة) · dev-server 200 لكل الوحدات الجديدة. الالتزام: `feat(map): visual rendering on globe — pins, polylines, results panel, camera focus (P4)` (ADR-033). الفحص البصري A-8 معلّق على المالك.

---

## P5 — المضلع والمساحة (معتمدة — ADR-034)
- [x] **T5.1 — وضع رسم مضلع (نقرات + معاينة + إغلاق)** `M`
  1. `src/store/usePolygonStore.ts`: رؤوس `{ id, lat, lon, height? }` + حالة `idle/drawing/closed` + إضافة/تراجع/إغلاق/مسح/استبدال.
  2. `src/features/map/usePolygonDraw.ts`: `LEFT_CLICK` عبر `pickGlobeCoordinates`، إغلاق بالنقر على الرأس الأول (16px) أو الزر، معاينة `MOUSE_MOVE`، و`Escape` (إغلاق عند ≥3 رؤوس وإلا إلغاء).
  3. `src/features/map/usePolygonEntities.ts`: نقاط الرؤوس + خط خارجي `clampToGround` + تعبئة شفافة + خط معاينة متقطع.
  4. `src/features/polygon/PolygonTools.tsx`: رسم/إنهاء/تراجع/مسح + عدد الرؤوس، وربطها بـ`App`/`MapView`/`Sidebar` مع منع تعارض وضع النقر.
  5. مفاتيح `polygon.*` في `ar.json`/`en.json` + أنماط CSS.
  - القبول: رسم 3+ رؤوس · معاينة لحظية · إغلاق صحيح · تراجع/مسح · لا نقطة مسار أثناء وضع المضلع · AR/EN · بلا أخطاء Console.
- [x] **T5.2 — المساحة الجيوديسية (GeographicLib PolygonArea)** `M`
  1. `src/core/geo/areaGeodesic.ts`: `Geodesic.WGS84.Polygon()` + `Compute(false, true)` ثم `Math.abs` (لأن `sign=false` تعيد المتممة عند عكس الاتجاه)؛ تعيد المساحة م² + المحيط + مفتاح المنهجية؛ `null` عند <3 نقاط؛ الارتفاع مهمَل.
  2. `tests/fixtures/area-reference.json`: قيم من `pyproj 3.7.2 / PROJ 9.5.1` (Karney) + توثيق المصدر.
  3. `tests/areaGeodesic.test.ts`: مربع الرياض · مثلث الرياض–جدة–الدمام · عبور خط التاريخ · اتجاه اللف · النقاط المكررة/المتدهورة.
  - القبول: تطابق نسبي < `1e-6` مع المراجع · استقلال عن اتجاه اللف · اختبارات خضراء.
- [x] **T5.3 — مساحة UTM + Shoelace مع تحذير النطاق** `M`
  1. توسيع `src/core/coords/utm.ts` بـ`wgs84ToUtmInZone` (إسقاط خام في منطقة محددة، بلا تحقق Easting/Northing).
  2. `src/core/geo/areaUtm.ts`: منطقة centroid + Shoelace + `Math.abs`؛ تحذير `multi-zone` مع الحساب في منطقة المركز؛ وإيقاف UTM مع سبب عند `multi-hemisphere`/`antimeridian`/الخروج من 80°S–84°N.
  3. `tests/areaUtm.test.ts` + توسيع `tests/utm.test.ts` بقيم مرجعية.
  - القبول: UTM قريب من الجيوديسية داخل منطقة واحدة ضمن تشوه الإسقاط · تحذير تعدد المناطق · لا رقم مضلل في الحالات الحدية.
- [x] **T5.4 — عرض المقارنة + شرح الفرق** `S`
  1. `src/core/units/unitTypes.ts` + `areaConverters.ts`: m²/ha/km²/ft²/acre/mi².
  2. `src/features/polygon/areaFormat.ts`: تحويل/تنسيق/فرق موقّع + اختبارات.
  3. `src/features/polygon/AreaComparison.tsx`: المساحتان + المنهجيتان + الفرق + الشرح + التحذيرات + تبديل الوحدات (الافتراضي هكتار).
  4. دمج القسم في `Sidebar` + CSS + i18n.
  - القبول: المساحتان والفرق والشرح والتحذيرات · AR/EN وRTL/LTR · الشريط 320px.

**DoD المرحلة:** ✅ تقنيًا — مساحتان ظاهرتان مع نسبة الاختلاف موضحة (157 اختبارًا · build ناجح). الفحص البصري A-9 معلّق على المالك.

---

## P6 — الحفظ والتصدير والإعدادات (معتمدة — ADR-035)
- [ ] **T6.1 — Repository + Dexie (مخطط v1) + اختبارات** `M`
  1. `src/lib/dexie.ts`: قاعدة `geo3d-measure`، `sessions: 'id, updatedAt'` و`settings: 'key'`، مخطط v1.
  2. `src/services/sessionRepository.ts` + `settingsRepository.ts`: CRUD + إعدادات + `lastSessionId` + أخطاء مرمزة + تحقق zod.
  3. `fake-indexeddb` كـdevDependency + `"DOM"` في `tsconfig.node.json` للاختبارات.
  4. اختبارات CRUD وإعادة فتح القاعدة والجلسة التالفة.
  - القبول: كل اختبارات التخزين خضراء في Node.
- [ ] **T6.2 — حفظ/فتح/حذف الجلسات + حفظ تلقائي** `M`
  1. `src/store/useSessionStore.ts` + `sessionSnapshot.ts` + `useSessionPersistence.ts`.
  2. `src/features/sessions/SessionManager.tsx`: اسم/حفظ/جلسة جديدة/فتح/حذف بخطوتين + حالة الحفظ.
  3. Auto-save بعد أول حفظ صريح (debounce 800ms)، واستعادة آخر جلسة، وتأطير `frameAll` للبيانات المستعادة.
  4. `replacePoints` في مخزن النقاط + إلغاء/تفريغ الحفظ المعلّق قبل تبديل الجلسة.
  - القبول: حفظ → تعديل → استعادة بعد إعادة التحميل · فتح/حذف/جلسة جديدة · بلا تعارض عند التبديل السريع · AR/EN.
- [ ] **T6.3 — تصدير GeoJSON / KML / CSV** `M`
  1. `src/services/exportFormat.ts` (نقي): GeoJSON RFC 7946 (Point + Polygon + إغلاق الحلقة) · KML (XML escaping + clampToGround) · CSV (RFC 4180 + BOM عند التنزيل).
  2. `src/services/exportService.ts`: Blob/URL/anchor + أسماء ملفات آمنة.
  3. `src/features/export/ExportPanel.tsx`: ثلاثة أزرار + تعطيل عند غياب البيانات.
  4. اختبارات serializers والـescaping.
  - القبول: الملفات الثلاثة صالحة في QGIS/Google Earth/Excel · العربية سليمة.
- [ ] **T6.4 — الإعدادات (وحدات، صيغة إحداثيات، لغة)** `M`
  1. `src/store/useSettingsStore.ts`: مسافة (m/km/mi/ft/nm) + مساحة (m²/ha/km²/ft²/acre/mi²) + صيغة (DD/DMS/UTM/MGRS) + الافتراضيات (km/ha/DD).
  2. `src/features/settings/SettingsPanel.tsx` + ربط `ResultsPanel` و`AreaComparison`.
  3. `src/core/coords/formatPoint.ts` وعرض الصيغة في `PointsPanel`/`PointTooltip` مع fallback إلى DMS.
  4. حفظ الإعدادات في Dexie، واللغة تبقى في `localStorage`.
  - القبول: التغيير ينعكس فورًا ويبقى بعد إعادة التحميل · AR/EN · بلا أخطاء Console.
- [ ] **T6.5 — استكمال الترجمة 100% AR/EN** `S`
  1. كل مفاتيح P5/P6 في `ar.json`/`en.json` + توسيع `tests/i18n.test.ts`.
  2. مراجعة النصوص المضمّنة في JSX وإزالة المفاتيح غير المستخدمة.
  3. مراجعة RTL/LTR للأرقام والإحداثيات وأزرار التصدير.

**DoD المرحلة:** جلسة كاملة تُحفظ وتُستعاد بعد إعادة التحميل وتُصدَّر بالصيغ الثلاث + فحص بصري A-10 (معلّق على المالك).

---

## P7 — الجودة والإطلاق (تُفصَّل كاملة وتُعتمد قبل البدء)
- [ ] **T7.1 — مراجعة تغطية الاختبارات + سيناريوهات E2E يدوية** `M`
- [ ] **T7.2 — الأداء: تقسيم الحزم + زمن الإقلاع** `M`
- [ ] **T7.3 — موبايل + RTL/LTR polish + إتاحة أساسية** `M`
- [ ] **T7.4 — دليل استخدام (AR/EN) + توثيق النشر** `S`
- [ ] **T7.5 — نشر تجريبي (HTTPS إلزامي لـGPS)** `S`

**DoD المرحلة:** v1.0 جاهزة/منشورة + التوثيق مكتمل.

---

## المخاطر المرصودة (تُدار عبر المراحل)
| # | المخاطرة | التخفيف |
|---|---|---|
| R-1 | حجم Cesium كبير ← بطء أول تحميل | تقسيم الحزم + مؤشر تحميل |
| R-2 | حدود Cesium ion المجانية | مراقبة الاستخدام + خطة بديل مفتوح للتضاريس |
| R-3 | حد استخدام Nominatim | debounce + cache + قابلية تبديل المزود |
| R-4 | GPS يتطلب HTTPS/localhost | التطوير على localhost + النشر على HTTPS |
| R-5 | دقة Haversine أقل من Vincenty | توثيق الفرق في الواجهة + Strategy جاهزة للترقية |
