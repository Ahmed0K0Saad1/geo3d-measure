# STATE.md — لوحة حالة المشروع الحية

> **أول ملف يُقرأ في أي جلسة.** يُحدَّث بعد كل مهمة.

| البند | القيمة |
|---|---|
| آخر تحديث | 2026-10-21 — الجلسة 20 |
| المرحلة الحالية | **P7 — الجودة والإطلاق** (T7.1 مكتملة — T7.2 التالية) |
| حالة المرحلة | ⏳ T7.1 ✅ (192/192) — T7.2–T7.5 قيد التنفيذ |
| المهمة الجارية الآن | **T7.2 — الأداء: تقسيم الحزم + زمن الإقلاع** |
| المهمة التالية | **T7.2 ثم T7.3 → T7.4 → T7.5 (Vercel)** |
| إعاقات تقنية | لا يوجد |

## بنود معلّقة على المالك (Action Items)
| # | البند | مطلوب عند |
|---|---|---|
| A-1 | ✅ تم — الحساب أُنشئ والتوكن مستلم ومحفوظ في `.env` محلياً (خارج Git) — فحص ion API: HTTP 200 | مُغلق (2026-10-19) |
| A-2 | الفحص البصري لتوسعة T1.7 (تبديل 3 خرائط أساس · تسميات/تضاريس · AR/EN بلا أخطاء Console) | قبل إغلاق مراجعة P1 بصريًا |
| A-3 | الفحص اليدوي لزر «موقعي الحالي» وعلامة النقطة على الكرة في متصفح حقيقي (GPS + رفض الإذن) | مراجعة T2.2 |
| A-4 | الفحص اليدوي للإدخال اليدوي (DD/DMS · UTM · MGRS): صحة معاينة الصيغ الأربع · رسائل الأخطاء · إضافة النقطة للكرة · AR/EN | مراجعة T2.3/T2.4 |
| A-5 | الفحص اليدوي لوضع النقر: دخول/خروج (Esc وبعد الإضافة) · نقطة على التضاريس بارتفاع · مؤشر crosshair · AR/EN | مراجعة T2.5 |
| A-6 | الفحص اليدوي للبحث: نتائج حية بعد 600ms · اختيار نتيجة يضيف نقطة على الكرة · إسناد OSM · مشاهد 429/انقطاع الشبكة · AR/EN | مراجعة T2.6 |
| A-7 | الفحص اليدوي لقائمة النقاط: ترقيم 1..n · تعديل التسمية (حفظ/إلغاء/Enter/Esc) · حذف مع تصفير الاختيار · الترتيب أعلى/أسفل وتزامن أرقام الكرة · التركيز flyTo · AR/EN | مراجعة T2.7 |
| A-8 | الفحص البصري لـP4: دبابيس مرقّمة/ملونة · تلميح عند التمرير · خط أزرق والمقطع المحدد أحمر · لوحة النتائج والإجمالي وتبديل الوحدات · التركيز التلقائي عند الإضافة ومن القائمة · AR/EN بلا أخطاء Console | قبل إغلاق مراجعة P4 بصريًا |
| A-9 | الفحص البصري لـP5: رسم مضلع 3+ رؤوس · معاينة متقطعة · إغلاق بالرأس الأول/الزر/Esc · تراجع/مسح · عدم تعارض وضع النقر · المساحتان والفرق والتحذيرات · تبديل وحدات المساحة · AR/EN وRTL/LTR بلا أخطاء Console | قبل إغلاق مراجعة P5 بصريًا |
| A-10 | الفحص البصري لـP6: حفظ جلسة ← تعديل ← إعادة تحميل (استعادة تلقائية) · جلسة جديدة/فتح/حذف بخطوتين · تصدير GeoJSON/KML/CSV وفتحها في QGIS/Google Earth/Excel · تغيير الوحدات وصيغة الإحداثيات واللغة وبقاؤها بعد إعادة التحميل · AR/EN بلا أخطاء Console | قبل إغلاق مراجعة P6 بصريًا |
| A-11 | الفحص اليدوي للإتاحة والموبايل (P7): Tab/Enter/Escape · قارئ شاشة · تباين AA · 360×640 و390×844 و844×390 · RTL/LTR · GPS على HTTPS | قبل وسم v1.0.0 |

## مراجع سريعة
- المتطلبات المعتمدة: `REQUIREMENTS.md` (v1.0)
- الخطة والمهام: `ROADMAP.md`
- التصميم التقني: `ARCHITECTURE.md`
- سجل القرارات: `DECISIONS.md`

## أسئلة مفتوحة (OQ)
| الرقم | السؤال | الوضع |
|---|---|---|
| OQ-1 | تأكيد افتراض "نقاط متعددة: مسافة كل مقطع متتالٍ + إجمالي + اتجاه لكل مقطع" (FR-6/FR-7) | افتراض مبدئي معتمد حتى تصحيح المالك |
| OQ-2 | الاسم النهائي للمشروع (الحالي مؤقت: Geo3D Measure) | مفتوح |
| OQ-3 | إضافة هامش دقة GPS إلى نموذج GeoPoint (مطلوب لـFR-1) | مغلق — أُضيف `accuracy` في T2.2 (ADR-025) |

## سجل الجلسات (الأحدث أولًا)
### الجلسة 20 — 2026-10-21 — P7/T7.1: بوابة الإتاحة والاختبارات
- تفصيل P7 كاملة (T7.1–T7.5) واعتمادها من المالك: Vercel للنشر + التزام Git لكل مهمة.
- جديد: `tests/accessibility.test.tsx` (jsdom + fake-indexeddb + axe-core، وسوم WCAG A/AA، حالتا AR/RTL وEN/LTR مع نقاط ومضلع) · `tests/e2e/manual-scenarios.md` (12 سيناريو يغطي A-2..A-11 + الموبايل + الفشل الشبكي) · سكربت `test:coverage`.
- تعديلات: `vitest.config.ts` (شمول `.tsx` + تغطية v8) · `tsconfig.node.json` (`strict` + `jsx` + شمول `.tsx`) · devDeps: axe-core 4.14 · jsdom 29.1 (متوافق Node 24.14) · @testing-library/react 16.3 · @testing-library/dom · @vitest/coverage-v8 5.0.5 · `ResultsPanel`/i18n: `aria-label` يطابق النص المرئي (WCAG 2.5.3) بعد اكتشاف axe.
- قرار: ADR-036 — اختبار إتاحة حقيقي في jsdom + axe، والتباين/الخريطة يدويًا (لا WebGL/تخطيط في jsdom).
- تحقق: lint نظيف · format:check نظيف · test **192/192** (32 ملفًا؛ +2) · coverage **55.85%** statements (Cesium hooks غير مغطاة آليًا) · build ناجح (1931 وحدة؛ 4.86 MB / gzip 1.34 MB — R-1 كما هو).
- **T7.1 مكتملة** — التالية T7.2 (تقسيم الحزم + lazy Cesium).
- الالتزام: `test(quality): add WCAG AA axe tests and manual E2E scenarios (T7.1)`.

### الجلسة 19 — 2026-10-20 — P6: الحفظ والتصدير والإعدادات (T6.1–T6.5)
- جديد: `lib/dexie.ts` + `lib/ids.ts` · `services/{sessionTypes,settingsTypes,sessionRepository,settingsRepository,sessionService,exportFormat,exportService}.ts` · `store/{useSessionStore,useSettingsStore,sessionSnapshot}.ts` · `core/coords/formatPoint.ts` · `features/sessions/{SessionManager,useSessionPersistence}.tsx` · `features/export/ExportPanel.tsx` · `features/settings/SettingsPanel.tsx` · `tests/{sessionRepository,sessionService,sessionSnapshot,settingsStore,formatPoint,exportFormat}.test.ts` (33 اختبارًا جديدًا صافيًا).
- تعديلات: `unitTypes` (tuples للتحقق zod) · `usePointsStore.replacePoints` · `usePolygonStore` (createId مشترك) · `useFlyTo` (`frameAll` + `fitAllToken` + كتم الطيران المزدوج) · `MapView` (تمرير token) · `ResultsPanel`/`AreaComparison` (وحدات مركزية) · `PointsPanel`/`PointTooltip` (صيغة الإحداثيات) · `App` (`useSessionPersistence`) · `Sidebar` (الجلسات/التصدير/الإعدادات) · `Header` (إزالة placeholder الوحدات) · i18n `sessions/export/settings` + `results.units.mi/ft` وإزالة مفاتيح غير مستخدمة · CSS · `tsconfig.node.json` (`DOM`) · ROADMAP/ARCHITECTURE/STATE/DECISIONS.
- قرار: تنفيذ ADR-035 بلا انحراف معماري؛ الجلسة لقطة (نقاط + مضلع + إعدادات عرض) بلا لغة/كاميرا/تحديدات، واللغة تبقى في `localStorage`. ملاحظة تنفيذية: Dexie 4.4.6 يُستورد `{ Dexie }` بدل default تحت NodeNext لتفادي TS2507.
- تحقق: lint نظيف · format:check نظيف · test **190/190** (31 ملفًا؛ +33) · build ناجح (1931 وحدة؛ 4.86 MB / gzip 1.34 MB — R-1 متوقع) · dev-server (منفذ 4181): الصفحة ووحدات P6 كلها HTTP 200 · `npm audit --omit=dev`: 0 ثغرات إنتاجية.
- **P6 مكتملة تقنيًا** — الفحص البصري A-10 معلّق على المالك.
- الالتزام: `feat(session): add local sessions, GeoJSON/KML/CSV export, and settings (P6)`.

### الجلسة 18 — 2026-10-20 — P5: المضلع والمساحة (T5.1–T5.4)
- جديد: `core/geo/areaGeodesic.ts` (GeographicLib `PolygonArea` — `Compute(false, true)` + `Math.abs`) · `areaUtm.ts` (منطقة centroid + Shoelace + تحذيرات `multi-zone`/`multi-hemisphere`/`antimeridian`/`outside-utm-range`) · `core/coords/utm.ts` (`wgs84ToUtmInZone`) · `core/units/{unitTypes,areaConverters}.ts` · `store/usePolygonStore.ts` · `features/map/{usePolygonDraw,usePolygonEntities,polygonGeometry,polygonEntityIds}.ts` · `features/polygon/{PolygonTools,AreaComparison,areaFormat}.tsx` · اختبارات `areaGeodesic`/`areaUtm`/`areaFormat`/`areaUnits`/`polygonStore`/`polygonGeometry` + fixture `area-reference.json` (pyproj 3.7.2 / PROJ 9.5.1).
- تعديلات: `App` (وضع المضلع وتعارضه مع وضع النقر) · `Sidebar` (PolygonTools + AreaComparison وإزالة قائمة الأدوات المعطلة) · `MapView` (هوكان المضلع + crosshair موحّد) · `utm.test.ts` (+1) · i18n `polygon.*`/`area.*`/`measure.method.*` · CSS للرسم والمقارنة · ROADMAP/ARCHITECTURE/DECISIONS.
- قرار: ADR-034 — تفعيل ADR-017 وADR-013، وتثبيت `wgs84ToUtmInZone` بدل `wgs84ToUtm` لكل رأس، وإيقاف UTM في الحالات الحدية بدل رقم مضلل. اكتشاف عملي: `sign=false` تعيد متممة المساحة عند عكس اللف، لذا اعتُمد `Compute(false, true)`.
- تحقق: lint نظيف · format:check نظيف · test **157/157** (25 ملفًا؛ +34) · build ناجح (1912 وحدة؛ 4.75 MB / gzip 1.30 MB — R-1 متوقع) · `npm audit --omit=dev`: 0 ثغرات إنتاجية.
- **P5 مكتملة تقنيًا** — الفحص البصري A-9 معلّق على المالك.
- الالتزام: `feat(polygon): add polygon drawing and geodesic/UTM area comparison (P5)`.

### الجلسة 17 — 2026-10-20 — P4: العرض البصري على الكرة (T4.1–T4.4)
- جديد: `features/map/pinImage.ts` (SVG Data URI للدبابيس: 8 ألوان + رقم + حلقة ذهبية للمختار) · `tooltipPosition.ts` (تثبيت التلميح) · `usePointHover.ts` (`MOUSE_MOVE` + `scene.pick`) · `PointTooltip.tsx` (HTML overlay) · `pathGeometry.ts` (مقاطع نقية) · `usePathEntities.ts` (Polyline جيوديسية مثبَّتة على الأرض) · `features/points/resultsFormat.ts` (وحدات/اتجاهات) · `ResultsPanel.tsx` (جدول المقاطع + الإجمالي + منهجية + تبديل وحدات).
- تعديلات: `usePointEntities` (Billboard بدل point · CLAMP_TO_GROUND للنقاط بلا ارتفاع · إزالة disableDepthTestDistance) · `MapView` (حاوية canvas منفصلة + التلميح + usePathEntities) · `usePointsStore` (`selectedSegmentIndex` + تصفيره عند الحذف/الترتيب) · `useFlyTo` (كشف النقطة المضافة + تأطيرها مع السابقة + `altitude` في الطلب) · `Sidebar` (ResultsPanel) · `index.css` (عرض 320px + أنماط الجدول/التلميح) · `ar.json`/`en.json` (`results.*`).
- قرار: ADR-033 — تصحيحات على مسودة المالك: التلميح عبر overlay لا `Entity.description` · لوحة النتائج خارج `PointsTools` · تحديد المقطع بفهرس مستقل · تأطير النقطة مع السابقة · إصلاح غياب الارتفاع تحت التضاريس · رقم القرار 033.
- اختبارات جديدة (29): `pinImage` 5 · `pointHover` 4 · `pathGeometry` 4 · `resultsFormat` 4 · `pointsStore` +3 · `flyTo` +9.
- تحقق: lint نظيف · format:check نظيف · test **123/123** (19 ملفًا؛ +29) · build ناجح (1899 وحدة؛ 4.71 MB / gzip 1.29 MB — R-1 متوقع) · dev-server (منفذ 4180): الصفحة وكل الوحدات الجديدة HTTP 200.
- **P4 مكتملة تقنيًا** — الفحص البصري A-8 معلّق على المالك (الدبابيس/التلميح/الخط/الأحمر/اللوحة/الوحدات/الكاميرا/AR-EN).
- الالتزام: `feat(map): visual rendering on globe — pins, polylines, results panel, camera focus (P4)`.

### الجلسة 16 — 2026-10-20 — P3: محرك القياس (T3.1–T3.5)
- جديد: `src/core/geo/strategy.ts` (`SegmentResult` · `DistanceStrategy` · `DistanceStrategyRegistry`) · `registry.ts` (`StrategyRegistry` — آخر تسجيل لنفس `id` يفوز) · `haversine.ts` (`HaversineStrategy`; R=6371008.8 م · تقييد `h` · تطبيع الاتجاه · حالة النقطة المطابقة) · `path.ts` (`computePath`) · `src/core/units/converters.ts` (m↔km/nm/mi/ft بلا نصوص) · `tests/measure.test.ts` (18 اختبارًا) · `tests/units.test.ts` (5) · `tests/fixtures/geodesic-reference.json`.
- تصحيحات على مسودة المالك (ADR-032): استيراد `GeoPoint` · `import type` · إزالة حرف دخيل من `registry.ts` · النقطة المطابقة اتجاه 0 بدل 180 · تقييد `h` · إزالة `formatDistance` العربية من `core` · fixtures بدل الحدود الفضفاضة · اختبارات Registry وحماية `computePath`.
- مراجع: GeographicLib 2.1 WGS84 — ويلينغتون→سالامانكا 19,959,679.267 م (فرق Haversine +0.0387%) · بكين→سان فرانسيسكو 9,513,998 م واتجاهات 42.91642°/138.89027° (فرق 0.033°/0.024°) — حد 0.5%.
- تحقق: lint نظيف · format:check نظيف · test **94/94** (15 ملفًا؛ +23) · build ناجح (1888 وحدة).
- **P3 مكتملة تقنيًا** — لا بدء لـP4 قبل تفصيلها واعتمادها.
- الالتزام: `feat(measure): haversine engine with bearing, path aggregation, and reference tests (P3)`.

### الجلسة 15 — 2026-10-20 — T2.7: قائمة النقاط + إغلاق P2 تقنيًا
- جديد: `features/points/PointsPanel.tsx` (ترقيم 1..n · تسمية داخلية حفظ/إلغاء/Enter/Esc · حذف مع تصفير الاختيار · ترتيب أعلى/أسفل · تركيز) · `features/map/useFlyTo.ts` (`FlyToRequest` + `camera.flyTo` بارتفاع `max(height+2000, 2000)` للتركيز) · `lib/collections.ts` (`moveItem` نقية) · `tests/collections.test.ts` (4) · `tests/flyTo.test.ts` (3).
- تعديلات: `App` (حالة `flyToRequest` + `focusPoint`) · `Sidebar` (تركيب PointsPanel وتمرير `onFocusPoint`) · `MapView` (استهلاك `useFlyTo`) · `index.css` (أنماط القائمة) · مفاتيح `points.panel.*` (ar/en) · `ARCHITECTURE §5/§6` (توثيق فصل Cesium وواجهة geocoding).
- تصحيحات على مواصفة المالك (ADR-030): الملف في `features/points/PointsPanel.tsx` وفق ROADMAP بدل `components/PointList.tsx` · إزالة `viewer: any` و`viewer` كليًا من المكوّن · التركيز عبر طلب حالة يستهلكه MapView بدل `camera.flyTo` داخل القائمة (وإزالة ازدواج `onFlyTo` + flyTo) · إضافة الترقيم وإعادة الترتيب المطلوبين · إصلاح `editLabel = ''` (تعيين لمتغير حالة ثابت) إلى `cancelEditing` · نصوص i18n بدل العربية المضمنة · زر حذف يصفّر الاختيار ويغلق التحرير.
- تحقق: lint نظيف · format:check نظيف · test **71/71** (13 ملفًا؛ +7) · build ناجح (1888 وحدة) · dev-server: PointsPanel/useFlyTo/collections/App/Sidebar/MapView بـHTTP 200.
- **الفحص اليدوي المطلوب (A-7):** ترقيم وتزامن الكرة · تسمية/حفظ/إلغاء · حذف/اختيار · ترتيب أعلى/أسفل · تركيز flyTo · AR/EN.
- **P2 مكتملة تقنيًا** — لا بدء لـP3 قبل تفصيلها واعتماد المالك.
- **إغلاق P2:** بقرار المالك (2026-10-20) — الفحوص اليدوية A-2..A-7 تبقى بنود قبول بصري معلّقة (ADR-031).
- الالتزام: `feat(points): complete P2 point input and management (T2.3-T2.7)`.

### الجلسة 14 — 2026-10-20 — T2.6: البحث بالاسم عبر Nominatim
- جديد: `services/geocoding.ts` (واجهة `GeocodingProvider` — ADR-014 · تحقق zod من الاستجابة · كاش 50 · تصنيف 429/شبكة/استجابة غير صالحة · إسناد OSM) · `features/points/useGeocoding.ts` (debounce 600ms · `AbortController` · تنظيف المؤقت عند الإغلاق · حالات loading/error) · `features/points/GeocodingSearch.tsx` (حقل بحث · قائمة نتائج قابلة للنقر · حالات فراغ/خطأ/تحميل · رابط إسناد) · `tests/geocoding.test.ts` (7 اختبارات بلا شبكة).
- تعديلات: `PointsTools` (إضافة البحث) · `index.css` (أنماط البحث) · مفاتيح `points.search.*` (ar/en).
- تصحيحات على مواصفة المالك (ADR-029): إزالة `any` · `import type GeoPoint` · إزالة ترويسة `User-Agent` (محظورة في المتصفح وتسبب CORS preflight) · إلغاء الطلبات القديمة وتنظيف المؤقت · فحص `response.ok` و429 · تحقق zod من الحقول الخارجية · نقل الشبكة إلى خدمة قابلة للاستبدال · حذف `label` الاحتياطي العربي المولّد داخل المنطق (ADR-004).
- تحقق: lint نظيف · format:check نظيف · test **64/64** (11 ملفًا؛ +7) · build ناجح (1885 وحدة) · dev-server: geocoding/useGeocoding/GeocodingSearch/PointsTools بـHTTP 200.
- **الفحص اليدوي المطلوب (A-6):** بحث حي · اختيار نتيجة · ظهور النقطة على الكرة · إسناد OSM · محاكاة انقطاع الشبكة/429 · AR/EN.
- الالتزام (بانتظار موافقة المالك): `feat(search): add Nominatim place search (T2.6)`.

### الجلسة 13 — 2026-10-20 — T2.5: إضافة نقطة بالنقر على الخريطة
- جديد: `features/map/useMapClick.ts` (LEFT_CLICK → التقاط → نقطة `source: 'click'` · خروج بـEscape/بعد الإضافة · تسجيل وتنظيف `ScreenSpaceEventHandler`) · `features/map/mapPicking.ts` (`pickGlobeCoordinates` عبر `globe.pick` مع بديل `pickEllipsoid` + `cartesianToCoordinates` نقية).
- تعديلات: `App` (حالة `isClickMode` + callbacks مستقرة) · `Sidebar` و`PointsTools` (زر وضع بـ`aria-pressed` + تلميح) · `MapView` (تشغيل الهوك + فئة المؤشر) · `index.css` (`crosshair`) · مفاتيح `points.clickMode*` (ar/en).
- تصحيحات على مواصفة المالك (ADR-028): أنواع بدل `any` · `import type GeoPoint` · إزالة `Cartesian3` غير المستخدم · `Math as CesiumMath` · حماية `ray` وبديل `pickEllipsoid` · إضافة تسجيل الحدث والوضع/الخروج المطلوبة في ROADMAP · حذف `label` العربي المولّد داخل المنطق (ADR-004؛ الترقيم في T2.7).
- اختبارات: `tests/mapPicking.test.ts` — 3 اختبارات (الرياض بارتفاع · نصف جنوبي/الأصل · خط الطول 180).
- تحقق: lint نظيف · format:check نظيف · test **57/57** (10 ملفات؛ +3) · build ناجح (1882 وحدة) · dev-server: useMapClick/mapPicking/MapView/App/PointsTools بـHTTP 200.
- **الفحص اليدوي المطلوب (A-5):** دخول وضع النقر · إضافة نقطة على التضاريس بارتفاع صحيح · خروج تلقائي بعد الإضافة · Esc · مؤشر crosshair · AR/EN.
- الالتزام (بانتظار موافقة المالك): `feat(map): add click-to-add point mode (T2.5)`.

### الجلسة 12 — 2026-10-20 — T2.4: UTM/MGRS + معاينة الصيغ الأربع
- اعتمادات جديدة: `proj4@2.22.0` + `mgrs@2.2.0` + `zod@4.6.7` (ADR-015/027)؛ تحذيرات `npm audit` الثلاث القديمة (high — dev-only) كما هي ومسجلة في ADR-011.
- `core/coords/utm.ts`: `wgs84ToUtm(lat, lon)` · `utmToWgs84(...)` · `utmZoneFor(lat, lon)` (تطويق 61→1 + النرويج 32V وسفالبارد 31X/33X/35X/37X) · `formatUtm` · `UtmError`.
- `core/coords/mgrs.ts`: `wgs84ToMgrs(lat, lon, precision=5)` · `mgrsToWgs84` عبر `toPoint` (مركز الخلية — بديل `reverse` غير الموجود في المكتبة) · `MgrsError`.
- `lib/validators.ts`: `geoPointDraftSchema` + `geoPointSchema` مطابقان لـGeoPoint (id · lat · lon · height? · accuracy? · label? · source · createdAt).
- واجهة: مبدّل صيغ (DD/DMS · UTM · MGRS) داخل `ManualPointInput` + معاينة فورية للصيغ الأربع + مصدر النقطة حسب الصيغة + مفاتيح `points.manual.formats|utm|mgrs|preview` (ar/en).
- قيم مرجعية: UTM من PROJ (pyproj 3.7.2 — مطابقة لمخرجات proj4js) · MGRS من متجهات GEOTRANS الرسمية (`33UXP0500444997` · `11SPA7234911844`).
- تحقق: lint نظيف · format:check نظيف · test **54/54** (9 ملفات؛ +22) · build ناجح (1880 وحدة؛ الحزمة +230 KB تقريبًا لـproj4/mgrs/zod) · dev-server: utm/mgrs/validators/ManualPointInput/PointsTools بـHTTP 200.
- **الفحص اليدوي المطلوب من المالك (A-4 المحدّث):** الإدخال بالصيغ الثلاث · صحة معاينة الصيغ الأربع · رسائل الأخطاء · ظهور النقطة المرقّمة على الكرة · AR/EN.
- الالتزامات بانتظار موافقة المالك: T2.3 `feat(coords): add DD/DMS manual input with live preview (T2.3)` ثم T2.4 `feat(coords): add UTM and MGRS support with zod validation (T2.4)`.

### الجلسة 11 — 2026-10-20 — T2.3: إدخال يدوي DD/DMS + معاينة فورية
- `core/coords/parsers.ts` بمواصفة المالك مع تصحيحات موثقة (ADR-026): `parseDD` · `parseDMS` (رموز/نقطتان/مسافات + نصف كرة بادئ/لاحق) · `parseCoordinate(input, axis)` بتحقق محوري (±90 للعرض/±180 للطول) وتطابق الاتجاه · `formatDD` · `formatDMS(value, axis?)` (N/S · E/W) مع تقريب كلي يمنع `60.00"`.
- أخطاء مرمزة (`CoordinateParseError`: invalid · out-of-range · invalid-minutes · invalid-seconds · hemisphere-mismatch) تُترجم من `points.manual.errors.*` (ADR-004) بدل نصوص عربية داخل core.
- واجهة: `ManualPointInput` داخل أدوات النقاط — حقلان بمعاينة فورية DD↔DMS، خطأ أسفل كل حقل، وزر إضافة (`source: manual`)؛ مفاتيح `points.manual.*` (ar/en) + أنماط CSS.
- اختبارات: `tests/coords.test.ts` — 15 اختبارًا بقيم مرجعية (الرياض 24.7136/46.6753، تحويل DMS، صيغ النقطتين/المسافات، الحدود، حمل التقريب).
- تحقق: lint نظيف · format:check نظيف · test **32/32** (6 ملفات؛ +15) · build ناجح (1678 وحدة) · dev-server: parsers/ManualPointInput/PointsTools بـHTTP 200.
- **الفحص اليدوي المطلوب من المالك (A-4):** إدخال DD وDMS في الحقلين، المعاينة الفورية، رسائل الأخطاء، ظهور النقطة المرقّمة على الكرة، AR/EN.
- الالتزام (بانتظار موافقة المالك): `feat(coords): add DD/DMS manual input with live preview (T2.3)`.

### الجلسة 10 — 2026-10-20 — T2.2: «موقعي الحالي» + أول عرض للنقاط على الكرة
- بمواصفة المالك للهوك + الخطة المعتمدة (ADR-024): `features/points/geolocation.ts` (نقي: positionToGeoPoint + أكواد أخطاء) · `useGeolocation` (نداء واحد، enableHighAccuracy=true، timeout=10s) · `PointsTools` في Sidebar (زر، انتظار، دقة ±م، رسائل أخطاء مترجمة) · `features/map/usePointEntities` (علامة + رقم لكل نقطة) · `useCesiumViewer` يعيد العارض.
- تعديلات على النموذج (ADR-025): `accuracy?: number` (FR-1) + رسائل الأخطاء أصبحت أكوادًا مترجمة بدل نصوص عربية داخل المنطق (ADR-004) + `label` يُمرَّر مترجمًا من الواجهة.
- مفاتيح `points.*` (ar/en: العنوان/الموقع/الانتظار/الدقة/5 أخطاء) · أنماط CSS للأدوات · 4 اختبارات لتحويل GPS وأكواد الأخطاء.
- تحقق: lint نظيف · format:check نظيف · test **17/17** (5 ملفات؛ +4) · build ناجح (1676 وحدة) · dev-server: `/` ووحدات PointsTools/useGeolocation/usePointEntities/MapView/Sidebar بـHTTP 200.
- **الفحص اليدوي المطلوب من المالك (A-3):** زر «موقعي الحالي» في متصفح حقيقي (إذن/رفض) + ظهور العلامة المرقّمة على الكرة + AR/EN.
- الالتزام (بموافقة المالك): `feat(points): add current-location GPS input and globe markers (T2.2)`.

### الجلسة 9 — 2026-10-20 — P2: اعتماد التفصيل + T2.1 (نموذج النقطة + مخزن Zustand)
- عُرض تفصيل P2 كاملًا (T2.1–T2.7) واعتُمد؛ المالك استبدل مواصفة T2.1 بمواصفته (الملفات والأفعال أدناه) وحسم موضع العرض الأولي للنقاط على الكرة: يدخل في T2.2 (ADR-024). ما زال معلَّقًا: الفحص البصري لتوسعة T1.7 (A-2 — لا يُعطّل P2).
- جديد: `src/core/geo/GeoPoint.ts` (كيان نقي: id · lat · lon · height? · label? · source · createdAt) · `src/store/usePointsStore.ts` (zustand 5.0.15 — add/remove/update/reorder/select + selectedPointId) · `tests/pointsStore.test.ts` (7 اختبارات بلا DOM).
- بنية تحتية: تثبيت `zustand@5.0.15`؛ تفعيل alias `@/` في `vitest.config.ts` (vitest لا يدمج vite.config تلقائيًا) وفي `tsconfig.node.json` — مع استيراد صريح بالامتداد `@/core/geo/GeoPoint.ts` (خرائط paths تحت NodeNext لا تفحص الامتدادات) و`import type` (متطلب verbatimModuleSyntax).
- تحقق: lint نظيف · format:check نظيف · test **13/13** (4 ملفات؛ +7) · build ناجح (1668 وحدة — بلا تغيير: المخزن غير مستورد بعد من التطبيق؛ تحذير R-1 متوقع).
- قرارات: ADR-012 ✅ (اعتماد Zustand) · ADR-023 (نموذج GeoPoint بمواصفة المالك) · ADR-024 (العرض الأولي للنقاط في T2.2).
- ملاحظات مفتوحة: هامش دقة GPS غير ممثَّل في النموذج (OQ-3 — يُحسم عند T2.2)؛ توليد `id`/`createdAt` مسؤولية المستدعي (كما بالمواصفة)؛ حذف نقطة مختارة لا يصفّر `selectedPointId` (يُحرَّر عند T4.1 إن لزم).
- الالتزام (بموافقة المالك): `feat(points): add GeoPoint model and Zustand store (T2.1)`.

### الجلسة 8 — 2026-10-20 — T1.7 extension: ثلاث خرائط أساس Esri + طبقات إضافية
- تحقق حي قبل التنفيذ: World Street Map وWorld Topo Map (المصدران الجديدان): metadata 200 + بلاطة 200 + CORS `*`؛ Imagery وBoundaries كما هما.
- جديد: `src/features/map/layerSources.ts` (مصدر حقيقة واحد: `BaseLayerId` · عناوين ArcGIS الثلاثة · التسميات · `WORLD_TERRAIN_ASSET_ID = 1`) + `tests/layers.test.ts` (يحرس: 3 مصادر Esri فقط، صفر Bing/virtualearth، تسميات Esri، أصل التضاريس 1 — 6/6 اختبارات).
- تعديلات: `LayerSelector` (قسمان: خريطة أساس واحدة من ثلاث بـradio أصلي + تسميات/تضاريس بـcheckbox؛ إغلاق خارجي/Escape مع إعادة التركيز للزر) · `useCesiumViewer` (`LayerState`: تبديل متزامن للخريطة الأساسية remove+destroy ثم add(0) — التسميات تبقى فوقها + كاش تضاريس + `errorEvent` لكل طبقة؛ `baseLayer: false` عند الإنشاء — مدعوم في تعريفات 1.146) · `MapView`/`App` (تمرير الحالة والروابط) · `index.css` (أنماط radio/checkbox + الفواصل + عناوين الأقسام) · `ar.json`/`en.json` (`streets`/`topographic`/`baseMaps`/`overlays` — 8 مفاتيح متطابقة).
- قرار: بلا debounce 150ms — تبديل Cesium متزامن لا سباق فيه؛ الحماية الفعلية `errorEvent` لكل طبقة وحارس التضاريس غير المتزامنة (ADR-022).
- تحقق: lint نظيف · format:check نظيف · test 6/6 · build ناجح (1668 وحدة؛ تحذير R-1 متوقع) · dev-server: الصفحة ووحدات LayerSelector/useCesiumViewer/layerSources بـHTTP 200.
- الالتزام (بموافقة المالك): `feat(map): extend layer selector with Esri base maps and ion terrain (T1.7 extension)`.
- **الفحص البصري المطلوب من المالك:** تبديل الخرائط الثلاث + إظهار/إخفاء التسميات والتضاريس بلا أخطاء Console · قائمة سليمة في AR/EN وRTL/LTR.

### الجلسة 7 — 2026-10-19 — T1.7: مبدّل الطبقات المخصص (LayerSelector)
- مراجعة مستخدم بأدلة حية: أصول ion (2/3/4) `externalType: BING` والرابط الدقيق بمفتاح ion يرد **HTTP 401** للثلاثة؛ وخيار `imageryProvider` غير موجود في تعريفات Viewer 1.146 (الصحيح `baseLayer`، و`IonImageryProvider` حصراً عبر `fromAssetId`) ⇒ اعتُمد البديل العملي: تسميات Esri (ADR-021) بدلاً من إحياء مسارات ميتة.
- جديد: `src/components/LayerSelector.tsx` (قائمة منسدلة: صور/تسميات/تضاريس — إغلاق بنقرة خارجية أو Escape، aria-expanded/pressed، أيقونة SVG بلا مكتبات) · تعديلات: `useCesiumViewer` (يستقبل حالة الإظهار ويطبّقها: إظهار/إخفاء + إنشاء طبقة التسميات عند أول تفعيل + تبديل التضاريس بـ`CesiumTerrainProvider.fromIonAssetId(1)` مع كاش وحماية من التبديلات المتسارعة) · `MapView` (تمرير الحالة) · `Header` (فتحة children للمكونات الإضافية) · `App` (الحالة والربط) · `index.css` (أنماط القائمة + رفع طبقة الهيدر) · `ar.json`/`en.json` (مفاتيح `layers.*` — يفرضها اختبار التطابق).
- تحقق: lint نظيف · format:check نظيف · test 4/4 · build ناجح · dev-server: الصفحة ووحدتا LayerSelector/useCesiumViewer بـHTTP 200.
- الالتزام (بموافقة المالك): `feat(map): add custom layer selector with working Esri and ion layers`.
- **الفحص البصري المطلوب من المالك:** فتح/إغلاق القائمة · إظهار/إخفاء كل طبقة من الثلاث بلا أخطاء Console · اتجاه سليم في AR/EN.

### الجلسة 6 — 2026-10-19 — T1.6: الهيكل العام + ثنائية اللغة (وإغلاق P1)
- حزم جديدة: `i18next@26.5.2` + `react-i18next@17.1.0` (تطبيق ADR-004 المعتمد).
- ملفات جديدة: `src/i18n/i18n.ts` (تهيئة + قواميس ar/en + حفظ الاختيار في localStorage + مزامنة lang/dir) · `src/components/Header.tsx` (العنوان + مبدّل AR/EN فوري + محدد وحدات placeholder) · `src/components/Sidebar.tsx` (منطقة أدوات — أزرار مستقبلية معطلة) · `src/features/map/MapView.tsx` (فصل حاوية الخريطة عن App) · `tests/i18n.test.ts` (تطابق مفاتيح ar/en + قيم غير فارغة).
- تعديلات: `App.tsx` (تجميع Header/Sidebar/MapView) · `index.css` (تخطيط app-shell بخصائص CSS منطقية تنقلب تلقائياً مع RTL) · `main.tsx` (تهيئة i18n) · `index.html` (`lang="ar" dir="rtl"`) · إعداد TS (`resolveJsonModule` + `esModuleInterop` للمشروعين) · اختبار JSON باستيراد `with { type: 'json' }` (متطلب NodeNext).
- تحقق: lint نظيف · format:check نظيف · test **4/4** · build ناجح (1666 وحدة — +32 بسبب i18next؛ 342 أصلاً — تحذير R-1 متوقع) · dev-server: الصفحة (RTL) ووحدات main/i18n/Header كلها HTTP 200.
- **إغلاق P1 ☑:** DoD محقق — كرة أرضية بتضاريس + واجهة AR/EN (تبديل فوري + RTL/LTR) + جودة كود مفعّلة + اختبارات خضراء.
- الالتزام (بموافقة المالك): `feat(ui): initial shell layout with AR/EN i18n (T1.6)`.
- **الفحص البصري النهائي (T1.5+T1.6) مطلوب من المالك:** كرة + صور Esri + تضاريس + تبديل لغة فوري + انقلاب التخطيط.

### الجلسة 5 — 2026-10-19 — T1.5: أول كرة أرضية حقيقية
- استلام توكن Cesium ion من المالك (A-1 ✅) وحفظه في `.env` محلياً — مؤكد أن Git يتجاهله (`git check-ignore`: `.gitignore:10`)، وصلاحية التوكن حيّة (`Ion API HTTP: 200`) دون طباعة القيمة.
- `useCesiumViewer` (وفق ARCHITECTURE §5): `Ion.defaultAccessToken` + `Viewer` مع `Terrain.fromWorldTerrain()` + إدارة دورة حياة آمنة مع StrictMode + استيراد `widgets.css`؛ `App` أصبح full-screen؛ `src/types/env.d.ts` يعرّف المتغير بلا any؛ حُذف سطر T1.2 المؤقت (بديله الدائم `tests/cesium.smoke.test.ts`).
- تحقق آلي: lint نظيف · format:check نظيف · test 3/3 · build ناجح (342 أصلاً؛ الحزمة 4.39 MB / gzip 1.19 MB — تحذير حجم القطعة متوقع ومسجَّل ضمن الخطر R-1) · dev-server: `/` و`widgets.css` والأصول وتحويلات main/App/hook كلها HTTP 200.
- **الفحص البصري (المحاولة 1) كشف عطلاً:** الكرة بلا صور. التشخيص بالأدلة: استجابة ion للأصل 2 = `{externalType:"BING"}` بلا `url` → كود Cesium 1.146 يوجّهها إلى `BingMapsImageryProvider.fromUrl` (عبر `IonImageryProviderFactory.BING`) → **Bing Maps for Enterprise متقاعدة** (404) → فشل طبقة الصور. التوكن والصلاحيات سليمة (الأصلان 1/2: HTTP 200) و**التضاريس تعمل** (`CesiumTerrainProvider.fromIonAssetId(1)`: نجح كاملاً). خط ArcGIS في الكونسول = عنصر داخل قائمة `BaseLayerPicker` الافتراضية (يتطلب مفتاحاً) وليس سبب العطل.
- **الإصلاح — ADR-020:** `baseLayerPicker: false` + صور أساسية من **Esri World Imagery** (خدمة REST بلا مفتاح — metadata وبلاطة فعلية وCORS: متحققة) + التضاريس تبقى من ion؛ الملف المتأثر: `useCesiumViewer.ts` (+ تحديث §5 في ARCHITECTURE وسطر T1.5 في ROADMAP).
- إعادة تحقق آلي بعد الإصلاح: lint نظيف · format:check نظيف · test 3/3 · build ناجح (342 أصلاً) · dev-server: `/` وhook و`widgets.css` بـHTTP 200.
- **الفحص البصري النهائي (صور + تضاريس + دوران/تقريب) مطلوب من المالك** لتوثيق السيناريو اليدوي.
- **الالتزام أُنشئ بموافقة المالك:** `feat(map): render real Cesium globe with Esri imagery and ion terrain (T1.5)` — مع معالجة أخطاء طبقة الصور (`errorEvent` → سجل واضح) ضمن الالتزام؛ والفحص البصري النهائي يُستكمل مع فحص T1.6.

### الجلسة 4 — 2026-10-19 — T1.4: هيكل المجلدات النهائي
- إنشاء الشجرة المعتمدة (`ARCHITECTURE` §3) داخل `src/`: 15 مجلداً جديداً مثبَّتة بـ`.gitkeep` — components · features/{map,points,measure,polygon,export,settings} · core/{geo,coords,units} · services · store · i18n · types · lib.
- نقل `src/App.tsx → src/app/App.tsx` (نقل بحت؛ المحتوى لم يُمس — سطر T1.2 المؤقت يبقى حتى تستبدله الكرة الأرضية في T1.5) + تحديث استيراد واحد في `main.tsx` إلى `@/app/App.tsx` (أول استخدام فعلي للـalias — مُثبت عبر tsc وVite معاً).
- تحقق: lint نظيف · format:check نظيف · test 3/3 خضراء · build ناجح **بنفس بصمة الحزمة السابقة** ⇒ صفر تغيير سلوكي.
- لا قرار جديد (الشجرة معتمدة سلفاً) ⇒ لا ADR.
- الالتزام أُنشئ بعد موافقة المالك: `refactor(app): establish final folder architecture (T1.4)`.

### الجلسة 3 — 2026-10-19 — T1.3: طبقة الجودة
- اعتماد نهائي: Oxlint يبقى أداة الفحص + Prettier 3.9.10 للتنسيق + Vitest 5.0.5 للاختبارات (**ADR-019**)؛ التوثيق العربي `*.md` مستثنى من التنسيق الآلي؛ `tests/` و`vitest.config.ts` مشمولان بفحص TS الصارم عبر `tsconfig.node.json`.
- اختبار دخان `tests/cesium.smoke.test.ts`: توفر Cesium في Node + ثوابت WGS84 (a=6378137 مضبوط، b≈6356752.314245179 بـ toBeCloseTo) — **لا يثبت أي وظائف قياس** (لم تُنفَّذ بعد).
- تحقق: lint نظيف · format:check نظيف · test 3/3 خضراء (2.97s) · build ناجح (342 أصلاً).
- الالتزام أُنشئ بعد موافقة المالك: `chore(quality): add prettier and vitest smoke test (T1.3)` — وشمل تحديث سطر جودة الكود في ARCHITECTURE (oxlint + prettier — ADR-019).

### الجلسة 2 — 2026-10-19 — تدقيق ومواءمة + T1.2
- تدقيق شامل كشف أن سقالة T1.1 نُفِّذت على القرص دون توثيق أو التزام Git؛ وُثّقت والتحقق منها (lint نظيف + build ناجح) والالتزمت.
- اعتماد بوابة T0.3 من المالك (إقرار الانتقال إلى P1)، ومواءمة ROADMAP/STATE/README مع الواقع.
- **T1.2 — دمج Cesium مع Vite ☑:** `cesium@1.146.0` + `vite-plugin-static-copy@4.1.1`؛ الإعداد الرسمي (نسخ Assets/Workers/ThirdParty/Widgets إلى `cesiumStatic` + `CESIUM_BASE_URL`) مع تكييف `stripBase` لإصدار v4؛ اعتماد **ADR-011 ✅**.
- **تحقق T1.2:** lint نظيف · build ناجح (342 أصلاً في `dist/cesiumStatic/`) · dev-server: الصفحة وWorkers وAssets كلها HTTP 200 · سطر تحقق في `App.tsx` يعرض ثابت WGS84 الصحيح (6378137 م).
- **ملاحظة:** `npm audit` يبلّغ عن 3 تحذيرات عالية dev-only (chokidar→braces داخل الـplugin) — موثقة في ADR-011 وتُتابع عند تحديث upstream.
- **التالي:** T1.3 — طبقة الجودة الأساسية (بانتظار اعتماد البدء).

### الجلسة 1 — 2026-10-19 — متطلبات وتأسيس
- حسم كل القرارات الكبرى: CesiumJS (ADR-001)، React+TS+Vite (ADR-002)، Haversine افتراضي + Strategy للترقية (ADR-003)، عربي+إنجليزي (ADR-004)، تخزين محلي خلف Repository (ADR-005)، أونلاين فقط v1 (ADR-006)، المساحة بطريقتين (ADR-007)، متري افتراضي + تبديل (ADR-008)، حساب Cesium ion (ADR-009)، منهجية التوثيق والبوابات (ADR-010).
- إنشاء مجلد المشروع `D:\geo3d-measure` + تهيئة Git + نظام التوثيق الكامل.
- **لم يُكتب أي كود تشغيلي** (باتفاق صريح مع المالك).
- **التالي:** T0.3 — مراجعة المالك واعتماده ← ثم T1.1.
