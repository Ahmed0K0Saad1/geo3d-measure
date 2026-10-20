# DECISIONS.md — سجل القرارات المعمارية (ADR)

> كل قرار: رقم، تاريخ، حالة (معتمد ✅ / مقترح 🕓 يُعتمد في مرحلته)، سياق، قرار، بدائل، أثر.
> لا يُغيَّر قرار "معتمد" إلا بقرار جديد يلغي القديم صراحة.

---

## ADR-001 — محرك العرض: CesiumJS ✅ (2026-10-19)
- **السياق:** نحتاج كرة أرضية 3D حقيقية بدقة GIS وتحكمًا كاملًا.
- **القرار:** CesiumJS.
- **البدائل المرفوضة:** MapLibre (عرض مسطح أساسًا) · Mapbox GL (مدفوع/توكن) · Google Maps 3D (قيود وتكلفة).
- **الأثر:** حزمة كبيرة تُعالج بتقسيم الحزم (R-1).

## ADR-002 — الواجهة: React + TypeScript + Vite ✅
- **القرار:** React + TS + Vite. **الأثر:** يتوافق مع كل المكتبات المستهدفة؛ لا حاجة لـSSR في v1.

## ADR-003 — محرك المسافات: Haversine افتراضيًا + نمط Strategy ✅
- **السياق:** المالك يريد سرعة استجابة الويب الآن، مع جاهزية لترقية مساحية دقيقة.
- **القرار:** Haversine هو الاستراتيجية الوحيدة في v1، خلف واجهة `DistanceStrategy` تسمح بإضافة Vincenty/Karney دون إعادة كتابة.
- **الأثر:** توثيق الفرق الكروي/الإهليلجي مع كل نتيجة (FR-14)، واختبارات مقارنة بـfixtures مرجعية.

## ADR-004 — الواجهة ثنائية اللغة AR/EN ✅
- **القرار:** عربي RTL افتراضي + إنجليزي LTR، عبر i18next. كل النصوص من ملفات ترجمة من اليوم الأول.

## ADR-005 — التخزين: محلي IndexedDB خلف Repository ✅ (المبدأ)
- **القرار:** IndexedDB مع Repository Pattern يسمح بإضافة سيرفر لاحقًا بدون تغيير الواجهة.
- **المكتبة:** Dexie مقترحة — تُعتمد في P6 (ADR-013).

## ADR-006 — أونلاين فقط في v1 ✅
- **القرار:** الصور والتضاريس من الإنترنت. العمل Offline مؤجل. **الأثر:** لا تعقيد تخزين مؤقت ضخم في v1.

## ADR-007 — المساحة: الطريقتان معًا للمقارنة ✅
- **القرار:** عرض المساحة الجيوديسية (GeographicLib) ومساحة UTM+Shoelace معًا مع نسبة الفرق — قيمة مهنية لمهندس GIS.

## ADR-008 — الوحدات: متري افتراضي + تبديل ✅
- **القرار:** م/كم، م²/هكتار/كم² افتراضيًا، مع تبديل لميل/قدم/ميل بحري.

## ADR-009 — مصدر الخرائط: حساب Cesium ion مجاني ✅
- **القرار:** العالم والتضاريس من Cesium ion Community، والتوكن في `.env` فقط (NFR-5).
- **بند معلق:** A-1 (المالك ينشئ الحساب، مطلوب عند T1.5).

## ADR-010 — منهجية التوثيق والبوابات ✅
- **القرار:** STATE/ROADMAP/REQUIREMENTS/ARCHITECTURE/DECISIONS كمصدر حقيقة + بوابة موافقة قبل كل إنشاء + التزام Git لكل مهمة + شرط "اشرح قبل التنفيذ".

## ADR-011 — تكامل Cesium مباشرة + الإعداد اليدوي الرسمي مع Vite ✅ (2026-10-19 — حُسمت في T1.2)
- **السياق:** اختيار طريقة دمج Cesium مع Vite: مغلف React جاهز؟ plugin مجتمعي؟ أم إعداد يدوي؟
- **القرار:** (1) لا مغلف React (مثل Resium) — تحكم كامل بدورة الحياة والكيانات بلا طبقات وسيطة. (2) الدمج عبر الإعداد الرسمي من CesiumGS: `vite-plugin-static-copy` لنسخ الأصول الأربعة (Workers / ThirdParty / Assets / Widgets) إلى `cesiumStatic/` + تعريف `CESIUM_BASE_URL` — مطابق للمثال الرسمي `CesiumGS/cesium-vite-example`.
- **البدائل المرفوضة:** `vite-plugin-cesium` المجتمعي — آخر إصدار 1.2.23 منذ أغسطس 2024، مبني على عصر Vite 3، مطوّر واحد ← مخاطرة توافق مع Vite 8. · مغلفات React الجاهزة — طبقات وسيطة وقيود على التحكم.
- **تكييف موثّق:** المثال الرسمي كُتب لإصدار الـplugin v1 (زمن Vite 5)؛ في v4 (اللازم لـVite 8) يُحفظ المسار الكامل للأصل — الحل: `rename: { stripBase: N }` بإزالة مقاطع `node_modules/cesium/Build/Cesium` الأربعة.
- **الأثر:** أصول Cesium (342 ملفاً) تُنسخ وتُخدَم من `/cesiumStatic` في dev والبناء — تحقق: lint نظيف · build ناجح · الأصول تُخدَم في dev (HTTP 200).
- **ملاحظة أمنية (dev فقط):** `npm audit` يبلّغ عن 3 تحذيرات عالية عبر `chokidar@3 → braces` داخل الـplugin — لا تُشحن للإنتاج ولا تُغذّى من مدخلات خارجية؛ تُتابع عند تحديث الـupstream.

## ADR-012 — إدارة الحالة: Zustand ✅ (اعتماد نهائي 2026-10-20 — T2.1)
- **السبب:** خفيف، بلا Boilerplate، ومناسب لفصل حالة التطبيق عن كيانات Cesium.
- **الحسم (T2.1):** `zustand@5.0.15`؛ أول مخزن `src/store/usePointsStore.ts` (points + selectedPointId)؛ يُختبر في Node بلا DOM عبر `getState()`؛ كيانات Cesium تُشتق منه عبر effect مركزي — بلا قراءة مباشرة من المخزن داخل Cesium (ARCHITECTURE §5).
- **البدائل المرفوضة:** Context API (إعادة رسم أوسع وبلا selectors دقيقة) · Redux Toolkit (ثقل boilerplate بلا حاجة فعلية الآن).

## ADR-013 — قاعدة IndexedDB: Dexie ✅ (اعتُمد فعليًا في P6 — 2026-10-20)
- **السبب:** API أنظف وإدارة إصدارات سكيمة أفضل من IndexedDB الخام أو LocalStorage.
- **التنفيذ:** `dexie@4.4.6` في `src/lib/dexie.ts` بمخطط v1 (`sessions: 'id, updatedAt'` · `settings: 'key'`)، خلف Repository في `src/services/sessionRepository.ts` و`src/services/settingsRepository.ts` (ADR-035).

## ADR-014 — مزود Geocoding: Nominatim، خلف واجهة قابلة للتبديل 🕓 (يُعتمد في P2)
- **السبب:** مجاني بدون مفتاح. **القيود:** حد استخدام ← debounce + cache + إسناد OSM. بديل: Photon.

## ADR-015 — مكتبات الإحداثيات: proj4js + mgrs ✅ (اعتُمد فعليًا في T2.4 — 2026-10-20)
- **السبب:** مرجعية ومختبرة لتحويلات UTM/MGRS؛ parsers DD/DMS تكتب يدويًا (بسيطة وقابلة للاختبار).
- **التنفيذ:** `proj4@2.22.0` + `mgrs@2.2.0` داخل `core/coords/utm.ts` و`mgrs.ts` مع أخطاء مرمزة — تفاصيل التكييفات في ADR-027.

## ADR-016 — الاختبارات: Vitest + Fixtures مرجعية ✅ (اعتُمد فعليًا في P3 — 2026-10-20)
- **القرار:** قيم مرجعية من GeographicLib 2.1 (WGS84) تُخزَّن JSON في `tests/fixtures`؛ اختبارات حدود نظرية للفرق الكروي/الإهليلجي (0.5%).
- **التنفيذ:** `tests/fixtures/geodesic-reference.json` + `tests/measure.test.ts` (ADR-032).

## ADR-017 — المساحة الجيوديسية: مكتبة GeographicLib (PolygonArea) ✅ (اعتُمد فعليًا في P5 — 2026-10-20)
- **السبب:** الدقة القياسية عالميًا (خوارزمية Karney) بدل تنفيذ ذاتي قابل للخطأ.
- **التنفيذ:** `geographiclib-geodesic@2.2.0` (رخصة MIT، المنفذ الرسمي من GeographicLib) عبر `Geodesic.WGS84.Polygon()` و`Compute(false, true)` ثم `Math.abs` في `src/core/geo/areaGeodesic.ts` (ADR-034). تحقق P5 العملي أثبت أن `sign=false` تعيد متممة المساحة للمضلع المعاكس الاتجاه، لذا اعتُمد التوقيع + القيمة المطلقة.

## ADR-018 — دلالة القياس الأساسية: نقاط متعددة متسلسلة 🕓 (مبدئي — OQ-1)
- **القرار المبدئي:** مسافة كل مقطع متتالٍ + الإجمالي + اتجاه لكل مقطع. يُعتمد نهائيًا بتأكيد المالك أو يُصحح بقرار جديد.

## ADR-019 — طبقة الجودة: Oxlint (بدل ESLint) + Prettier + Vitest ✅ (2026-10-19 — T1.3)
- **السياق:** حسم أدوات الفحص والتنسيق والاختبار في T1.3؛ كان `ARCHITECTURE.md` يقترح `eslint + prettier`.
- **القرار:** (1) **Oxlint** يبقى أداة الفحص — كان مثبتًا ومضبوطًا منذ T1.1، أسرع، ويكفي احتياجات React+TS الحالية (يُصحَّح سطر ARCHITECTURE بموجبه عند أول تحديث له). (2) **Prettier** للتنسيق بإعداد يحاكي نمط الكود القائم: `semi:false` و`singleQuote:true` — والتوثيق العربي `*.md` مستثنى من التنسيق الآلي حفاظًا على صياغته. (3) **Vitest 5.0.5** للاختبارات: البنية التحتية الآن (`tests/` + `vitest.config.ts`، بيئة node) — والاختبارات المرجعية للـcore تبقى في P3 حسب ADR-016.
- **البدائل المرفوضة:** ESLint + typescript-eslint (أبطأ واعتمادية أثقل دون حاجة فعلية الآن — إعادة النظر ممكنة بقرار جديد)؛ إخضاع التوثيق لدورة التنسيق الآلي (تشويش diffs مصدر-الحقيقة).
- **الأثر:** أوامر `lint` · `format`/`format:check` · `test` متاحة؛ اختبار دخان يتحقق من توفر Cesium وثوابت WGS84 فقط؛ ملفات الاختبارات و`vitest.config.ts` داخل فحص TS الصارم عبر `tsconfig.node.json`.

## ADR-020 — الصور الأساسية: Esri World Imagery بدل صور ion الافتراضية ✅ (2026-10-19 — T1.5)
- **السياق:** في الفحص البصري لـT1.5 ظهرت الكرة بلا صور. التشخيص بالأدلة: استجابة ion للأصل 2 = `{externalType:"BING"}` بلا `url` → كود Cesium 1.146 يوجّهها إلى `BingMapsImageryProvider` (عبر `IonImageryProviderFactory.BING`) → **Bing Maps for Enterprise متقاعدة** فترد 404 → فشل طبقة الصور. التوكن والصلاحيات سليمة (الأصلان 1/2: HTTP 200) و**التضاريس تعمل** (`CesiumTerrainProvider.fromIonAssetId(1)` نجح إنشاءً كاملاً). ملاحظة: خط `ibasemaps-api.arcgis.com` في الكونسول = عنصر داخل قائمة `BaseLayerPicker` الافتراضية (يتطلب مفتاحاً) وليس سبب العطل.
- **القرار:** الصور الأساسية من **Esri World Imagery** عبر خدمة REST الكلاسيكية المجانية بلا مفتاح (`services.arcgisonline.com/.../World_Imagery/MapServer` — وهي مثال توثيق Cesium الرسمي نفسه في `fromUrl`)، مع `baseLayerPicker: false` لمنع الاختيار التلقائي لـBing. **التضاريس تبقى من Cesium ion** (World Terrain).
- **البدائل المرفوضة:** الإبقاء على صور ion المضبوطة على BING — كلها عائلة متقاعدة (2/3/4) · Sentinel-2 عبر ion (الأصل 3954 غير متاح لهذا الحساب — مفحوص) · ArcGIS basemaps الجديدة `ibasemaps-api.arcgis.com` (تتطلب ArcGIS API key) · OSM (متحقق ويعمل، لكنه خريطة شوارع لا صور أقمار صناعية).
- **الأثر:** انحراف موثق ومسجَّل في ARCHITECTURE §5؛ توكن ion يبقى لازمًا للتضاريس وخدماته المستقبلية؛ **إسناد Esri مطلوب** في الواجهة (يُدرج ضمن واجهة الإسناد في T1.6/P7)؛ تُراجع المسألة عند معالجة Cesium/ion لتقاعد Bing (مرتبط بـR-2).

## ADR-021 — قائمة الطبقات: مبدّل مخصص بدل BaseLayerPicker المدمج ✅ (2026-10-19 — T1.7)
- **السياق:** طلب المالك قائمة تبديل طبقات («صور + تسميات + تضاريس»). القائمة المدمجة `BaseLayerPicker` بنودها الافتراضية تشير إلى خدمات ميتة (Bing — ADR-020) أو تتطلب مفاتيح، وإعادة تفعيلها تعرض للمستخدم عناصر معطوبة. وتسميات Bing (الأصل 3) غير قابلة للاستخدام: فحص حي أثبت أن الرابط الدقيق الذي يمنحه ion بمفتاحه المدمج يرد **HTTP 401** للأصول 2/3/4 جميعها.
- **القرار:** (1) يبقى `baseLayerPicker: false` — إزالة السطر تعيد الافتراضي (`true`) بالقائمة المكسورة. (2) مكوّن مخصص `LayerSelector` في الشريط العلوي يتحكم بإظهار ثلاث طبقات عاملة: صور Esri World Imagery · تسميات Esri World Boundaries and Places (شفافة فوق الصور — متحققة: metadata 200 + tile 200 + CORS) · تضاريس ion World Terrain. (3) حالة الإظهار في React (App + props) والـhook يطبّقها: إظهار/إخفاء الطبقات + تبديل التضاريس مع كاش وإلغاء تنظيف — بلا مكتبة حالة جديدة قبل P2.
- **البدائل المرفوضة:** إعادة `BaseLayerPicker` المدمج (عناصر ميتة/تتطلب مفتاحاً) · إحياء `assetId: 3` (عائلة Bing → 401) · خيار `imageryProvider` في Viewer (غير موجود في تعريفات 1.146 — الصحيح `baseLayer`، و`IonImageryProvider` يُستدعى حصراً عبر `fromAssetId`).
- **الأثر:** مفاتيح `layers.*` في `ar.json`/`en.json` (يفرضها اختبار تطابق المفاتيح) · مكوّن `LayerSelector` في `src/components` · إسناد Esri قائم (ADR-020).

## ADR-022 — توسيع مبدّل الطبقات: ثلاث خرائط أساس Esri + طبقات إضافية ✅ (2026-10-20 — T1.7 extension)
- **السياق:** طلب المالك توسيع `LayerSelector` إلى مجموعة خرائط أساس شبيهة بقائمة ArcGIS الأصلية (صور/شوارع/طبوغرافية) مع بقاء التسميات والتضاريس. تحقق حي قبل التنفيذ (2026-10-20): World Street Map وWorld Topo Map: metadata 200 + بلاطة 200 + CORS `*` (بلا مفتاح) — والمصدران السابقان (Imagery وBoundaries) كما هما.
- **القرار:** (1) الحالة أصبحت `LayerState { baseLayer: BaseLayerId; labels; terrain }` حيث `BaseLayerId = imagery | streets | topographic` — خريطة أساس **واحدة** بنمط radio + التسميات والتضاريس خياران مستقلان. (2) مصدر حقيقة واحد للثوابت في `features/map/layerSources.ts` (الأنواع + عناوين ArcGIS الثلاثة + التسميات + `WORLD_TERRAIN_ASSET_ID = 1`) — ليكون قابلاً للاختبار في Node بمعزل عن Cesium (استيراد الـhook مباشرةً يستورد `widgets.css` ويتطلب توكن ion في مستوى الوحدة). (3) التبديل **متزامن**: `imageryLayers.remove(previous, true)` ثم `add(nextLayer, 0)` (في الأسفل) كي تبقى التسميات فوق أي أساس — بلا debounce (لا سباق في Cesium أصلاً؛ الحماية الفعلية: `errorEvent` مستقل لكل طبقة + حارس التضاريس غير المتزامنة والكاش القائمين). (4) عناصر القائمة `<input type="radio/checkbox">` أصلية (دلالات ARIA ولوحة مفاتيح مجاناً) بدل أزرار مخصصة؛ زر الأيقونة يحتفظ بـ`aria-expanded`، والإغلاق خارجياً/Escape كما في ADR-021.
- **البدائل المرفوضة:** debounce 150ms (تأخير محسوس بلا حماية إضافية — التبديل متزامن) · إعادة تفعيل `BaseLayerPicker` المدمج (ADR-020/021) · اختبار الـhook مباشرةً في Node (مستحيل بلا DOM/Cesium Viewer) — عُوّض باختبار ثوابت المصادر.
- **الأثر:** ملف جديد `layerSources.ts` + اختبار `tests/layers.test.ts` (يحرس: 3 مصادر Esri فقط، صفر Bing/virtualearth، تسميات Esri، أصل التضاريس 1) · `LayerSelector`/`useCesiumViewer`/`MapView`/`App`/`index.css`/`ar.json`/`en.json` · مفاتيح `layers.*` الثمانية · إسناد Esri يبقى مستحقاً في الواجهة (ADR-020).

## ADR-023 — نموذج النقطة: GeoPoint ✅ (2026-10-20 — T2.1، بمواصفة المالك)
- **القرار:** `src/core/geo/GeoPoint.ts` كيان نقي مشترك بلا React/Cesium: `id` · `lat`/`lon` (درجات عشرية على WGS84) · `height?` (متر فوق المجسم الإهليلجي) · `label?` (اختياري — الترقيم المعروض بالترتيب لا بحقل) · `source: 'gps' | 'manual' | 'utm' | 'mgrs' | 'click' | 'geocoding'` · `createdAt: Date`؛ توليد `id`/`createdAt` مسؤولية المستدعي في هذه المرحلة.
- **البدائل المرفوضة:** `longitude`/`latitude` المطوّلة (اختار المالك `lat`/`lon`) · حقل `order` مخزّن (الترتيب = موضع المصفوفة في المخزن) · اسم إلزامي (الـ`label` اختياري).
- **الأثر:** يفرضه كل مسارات إدخال P2؛ أي تعديل على الحقول = ADR جديد؛ ملاحظة مفتوحة: هامش دقة GPS (FR-1) غير ممثَّل بعد (OQ-3).

## ADR-024 — موضع العرض الأولي للنقاط على الكرة ✅ (2026-10-20 — حسم المالك)
- **السياق:** تعارض صياغة: DoD المرحلة P2 يفرض «النقطة تظهر مرقمة على الكرة»، بينما T4.1 (P4) يصف «Pin مرقّم + Tooltip».
- **القرار:** العرض الأولي (علامة + رقم بسيطان مشتقان من المخزن) يدخل في T2.2 مع أول مصدر إدخال — والتصميم النهائي (Pin أيقوني + Tooltip + تمييز التحديد) يبقى في T4.1.
- **الأثر:** T2.2 يشمل `features/map/usePointEntities.ts` وإعادة `useCesiumViewer` العارض لربط المزامنة؛ لا تغيير في P4 سوى التوسعة البصرية.

## ADR-025 — نموذج GPS: هامش الدقة + أكواد أخطاء مترجمة ✅ (2026-10-20 — T2.2)
- **السياق:** FR-1 يطلب عرض هامش دقة GPS، ومواصفة المالك لـT2.2 تستخرج `accuracy` بينما ADR-023 لم يتضمنه (OQ-3). كذلك كانت مواصفة الهوك تعرض رسائل خطأ عربية جاهزة داخل الطبقة المنطقية — تتعارض مع ADR-004 (كل النصوص من ar/en).
- **القرار:** (1) إضافة `accuracy?: number` (بالمتر) إلى GeoPoint — تعديل على ADR-023 بقرار جديد. (2) الخطاف يرفض بـ`GeolocationError` يحمل كودًا (`unsupported` · `permission-denied` · `position-unavailable` · `timeout` · `unknown`) وتترجمه الواجهة من `points.errors.*`؛ لا نصوص واجهة داخل المنطق. (3) `label` يُمرَّر من الواجهة مترجمًا عند الإضافة (اختياري — ADR-023).
- **البدائل المرفوضة:** تمرير رسائل المتصفح الجاهزة كما هي (غير قابلة للترجمة وتتفاوت بين المتصفحات) · إبقاء accuracy في الواجهة فقط بلا تخزين (يُفقد عند الحفظ/التصدير في P6).
- **الأثر:** حقل جديد في النموذج · `tests/geolocation.test.ts` يحرس التحويل والأكواد · مفاتيح `points.*` في ar/en.

## ADR-026 — تحليل/تنسيق DD·DMS: أخطاء مرمزة وتحقق محوري ✅ (2026-10-20 — T2.3)
- **السياق:** مواصفة المالك لـ`parsers.ts` وضعت نصوص أخطاء عربية داخل `core` (تخالف ADR-004)، ولم تتحقق من الدقائق/الثواني، واستخدمت نطاقًا واحدًا ±180 للعرض والطول، وأخرجت `formatDMS` لاحقة غامضة `N/E` (قيمة مفردة لا تحدد المحور)، وذكرت دعم صيغة `40:26:47` دون تنفيذه، وكان التقريب قد ينتج `60.00"`.
- **القرار:** (1) `CoordinateParseError` بأكواد: `invalid` · `out-of-range` · `invalid-minutes` · `invalid-seconds` · `hemisphere-mismatch`، وتترجمها الواجهة من `points.manual.errors.*`. (2) `parseCoordinate(input, axis)` يفرض النطاق المحوري (±90 للعرض/±180 للطول) ويطابق نصف الكرة مع المحور. (3) دعم فعلي للصيغ: `40°26′47″N` · `40d26'47"N` · `40:26:47` · `40 26 47 N` · نصف كرة بادئ/لاحق/غائب · دقائق/ثوانٍ كسرية. (4) `formatDMS(value, axis?)` يخرج N/S للعرض وE/W للطول (وبلا لاحقة عند غياب المحور) مع تقريب كلي يمنع `60.00"`.
- **البدائل المرفوضة:** نصوص أخطاء جاهزة داخل core (غير قابلة للترجمة — ADR-004) · نطاق واحد ±180 (يقبل خط عرض 91 خطأً) · لاحقة `N/E` الغامضة.
- **الأثر:** `tests/coords.test.ts` (قيم مرجعية) · مكوّن `ManualPointInput` · مفاتيح `points.manual.*`؛ يتكامل مع ADR-015 (كتابة parsers يدويًا) دون تغيير.

## ADR-027 — تحويلات UTM/MGRS: واجهات موحّدة وأخطاء مرمزة ✅ (2026-10-20 — T2.4)
- **السياق:** مواصفة المالك استخدمت `mgrs.reverse` (غير موجودة؛ الصحيح `toPoint` للمركز أو `inverse` للحدود)، وحسبت منطقة UTM من الطول فقط (`lon=180` → 61 → EPSG غير معروف في proj4)، وخلطت ترتيب `(lon, lat)` مع `(lat, lon)`، وسكيمة zod ناقصة عن GeoPoint (`id` · `createdAt` · `accuracy`).
- **القرار:**
  1. واجهات موحّدة بترتيب `(lat, lon)` في `wgs84ToUtm`/`wgs84ToMgrs` وإرجاع `{ lat, lon }`.
  2. `utmZoneFor(lat, lon)`: تطويق 61→1 + الحالات المعيارية (النرويج 32V · سفالبارد 31X/33X/35X/37X) لتطابق سلوك MGRS.
  3. MGRS العكسي عبر `toPoint` (مركز الخلية) — والحدود عبر `inverse` عند الحاجة في T5.3.
  4. أخطاء مرمزة: `UtmError` (`invalid-coordinate` · `out-of-range` · `invalid-zone`) و`MgrsError` (`invalid-coordinate` · `out-of-range` · `invalid-precision` · `invalid-mgrs`) تترجمها الواجهة (ADR-004).
  5. zod: `geoPointDraftSchema` (مسودة بلا هوية/وقت) + `geoPointSchema` (كيان كامل + `accuracy`).
  6. الواجهة: مبدّل صيغ (DD/DMS · UTM · MGRS) يعرض معاينة الصيغ الأربع، ومصدر النقطة حسب الصيغة المستخدمة.
- **البدائل المرفوضة:** `inverse` كتحويل عكسي (يعيد مستطيل حدود لا نقطة) · حساب المنطقة بالطول وحده (يكسر الحالات الخاصة ويخالف MGRS) · نطاق عرض ±180 في UTM (غير معرّف خارج ±80/84).
- **الأثر:** `tests/utm.test.ts` · `tests/mgrs.test.ts` · `tests/validators.test.ts` (22 اختبارًا؛ UTM من PROJ/pyproj 3.7.2، MGRS من متجهات GEOTRANS الرسمية) · `ManualPointInput` · مفاتيح `points.manual.*` الجديدة.

## ADR-028 — وضع النقر على الخريطة: هوك مُدار والتقاط نقي ✅ (2026-10-20 — T2.5)
- **السياق:** مواصفة المالك قدّمت `useMapClick(viewer: any)` يعيد `handleClick` فقط بلا تسجيل حدث، مع `GeoPoint` كقيمة (تخالف `verbatimModuleSyntax`)، و`Cartesian3` غير مستخدم، و`Cesium.Math` غير مستورد، وبلا حماية لـ`ray`/`globe.pick` أو بديل `pickEllipsoid`، وتوليد `label` عربي داخل المنطق.
- **القرار:**
  1. أنواع صارمة: `viewer: Viewer | null` و`Cartesian2` — لا `any`.
  2. الهوك يسجّل `ScreenSpaceEventHandler` LEFT_CLICK عند تفعيل الوضع ويزيله عند الخروج؛ Escape يخرج أيضًا (ROADMAP).
  3. الالتقاط عبر `globe.pick` مع بديل `camera.pickEllipsoid`؛ التحويل النقي في `mapPicking.ts` قابل للاختبار في Node.
  4. الحالة مرفوعة إلى `App` (زر في `PointsTools` + تشغيل في `MapView`) — مصدر واحد للحقيقة.
  5. لا `label` مولّد: الترقيم/التسمية مسؤولية T2.7، والنصوص من i18n (ADR-004).
  6. المؤشر عبر فئة CSS على حاوية الخريطة بدل تعديل `viewer.canvas.style` من الهوك (تحذير react/immutability).
- **البدائل المرفوضة:** `any` · تعديل DOM للمؤشر من الهوك · `label` عربي داخل features · حلقة حدث محلية بلا حالة مرفوعة.
- **الأثر:** `tests/mapPicking.test.ts` (3 اختبارات) · `points.clickMode*` · بلا تغيير على `GeoPoint`.

## ADR-029 — البحث بالاسم: خدمة مُتحقَّقة وكاش وإلغاء طلبات ✅ (2026-10-20 — T2.6)
- **السياق:** مواصفة المالك وضعت كل الشبكة داخل الهوك مباشرة، بـ`any[]`/`any`، وبلا تنظيف للمؤقت أو إلغاء للطلبات، وبلا فحص `response.ok`/429 أو تحقق من شكل الاستجابة، وبترويسة `User-Agent` (محظورة في المتصفح وتسبب CORS preflight)، وبلا واجهة نتائج أو إسناد OSM.
- **القرار:**
  1. الشبكة في `services/geocoding.ts` خلف `GeocodingProvider` (ADR-014)؛ Nominatim هو المزوّد الافتراضي القابل للاستبدال.
  2. تحقق zod من الاستجابة الخارجية، وتصفية الإحداثيات خارج النطاق؛ النتائج بنوع `GeocodingResult` موحّد.
  3. كاش بسيط (50 استعلامًا، مفتاح غير حساس لحالة الأحرف) + تصنيف الأخطاء: `rate-limited` (429) · `network` (شبكة/غير 2xx) · `invalid-response` (JSON/مخطط غير صالح).
  4. لا `User-Agent` يدويًا؛ فقط `Accept: application/json` (سليم عبر CORS)؛ الإسناد عبر رابط OSM في الواجهة.
  5. الهوك يلغي الطلب السابق وdebounce عند كل تغيير، وينظّف المؤقت/الطلب عند الإغلاق، فلا `setState` بعد إلغاء.
  6. اختيار نتيجة يضيف نقطة `source: 'geocoding'` مع `display_name` كتسمية — بلا نص عربي مولّد داخل المنطق (ADR-004).
- **البدائل المرفوضة:** `any` · `User-Agent` في fetch المتصفح · طلبات غير قابلة للإلغاء · عرض الاستجابة بلا تحقق · مزوّد مثبّت داخل الهوك.
- **الأثر:** `tests/geocoding.test.ts` (7 اختبارات بلا شبكة) · `points.search.*` · لا تغيير على `GeoPoint` أو المخزن.

## ADR-030 — قائمة النقاط: مكوّن بلا Cesium وتركيز عبر طلب حالة ✅ (2026-10-20 — T2.7)
- **السياق:** مواصفة المالك طلبت `components/PointList.tsx` يستقبل `viewer: any` وينفّذ `camera.flyTo` مباشرة بجانب `onFlyTo` (ازدواج)، بلا ترقيم ولا إعادة ترتيب رغم اشتراط ROADMAP، وبكتابة `editLabel = ''` (تعيين لمتغير حالة ثابت)، ونصوص عربية مضمنة.
- **القرار:**
  1. المكوّن `features/points/PointsPanel.tsx` ويُركّب في Sidebar؛ لا يعرف Cesium ولا يستقبل `viewer`.
  2. التركيز: `PointsPanel` يختار النقطة ويرفع `FlyToRequest` إلى `App`، ويستهلكه `useFlyTo` داخل `MapView` (`camera.flyTo`). ارتفاع الكاميرا = `max(height + 2000, 2000)`.
  3. ترقيم 1..n من ترتيب المخزن (يتزامن مع أرقام العلامات على الكرة)؛ التسمية الفارغة تعود إلى «نقطة N» من i18n.
  4. إعادة الترتيب عبر `moveItem` النقية ثم `reorderPoints`؛ لا سحب وإفلات في v1.
  5. التسمية داخلية: حفظ/إلغاء + Enter/Escape؛ الحذف يصفّر الاختيار ويغلق التحرير.
  6. كل النصوص من `points.panel.*` (ADR-004).
- **البدائل المرفوضة:** `any` · تمرير العارض إلى مكوّن قائمة · استدعاء الكاميرا من مكوّنين · حذف/تسمية بلا i18n · قائمة بلا ترقيم أو ترتيب.
- **الأثر:** `tests/collections.test.ts` (4) + `tests/flyTo.test.ts` (3) · `points.panel.*` · لا تغيير على `GeoPoint` أو المخزن.

## ADR-031 — إغلاق P2 مع فحوص يدوية معلّقة ✅ (2026-10-20)
- **السياق:** اكتمل تنفيذ T2.1–T2.7 ونجحت lint · format:check · test 71/71 · build، لكن الفحوص اليدوية A-2..A-7 (GPS · الإدخال · النقر · البحث · القائمة · التوسعة البصرية) لم تُنفّذ بعد لأن الوكيل لا يشغّل متصفحًا تفاعليًا.
- **القرار:** المالك أمر بإغلاق P2 والالتزام بالعمل. تُعد P2 مغلقة تقنيًا، وتبقى A-2..A-7 بنود قبول بصري معلّقة تُنفّذ عند أول جلسة متصفح؛ أي خلل يفتح مهمة إصلاح لاحقة.
- **البدائل المرفوضة:** تأجيل الإغلاق حتى الفحص البصري (يعطّل P3) · اعتبار الفحص البصري منجزًا دون تنفيذ.
- **الأثر:** P3 هي التالية، ولا بدء لها قبل تفصيلها واعتمادها من المالك.

## ADR-032 — محرك القياس: Haversine + استراتيجية قابلة للتوسعة ✅ (2026-10-20 — P3)
- **السياق:** تحتاج P3 إلى عقد استراتيجية مسافة (Strategy) للتوسع نحو Vincenty/Karney لاحقًا، مع نتيجة تحمل اسم المنهجية (FR-14) واختبارات مرجعية. ADR-003 يحسم المبدأ، وهذا القرار يثبّت تفاصيل التنفيذ. (الرقم 031 محجوز لقرار إغلاق P2.)
- **القرار:**
  1. `src/core/geo/strategy.ts`: `DistanceStrategy { id, labelKey, compute(a,b) }` + `SegmentResult { meters, initialBearingDeg, finalBearingDeg, method }` + `DistanceStrategyRegistry`.
  2. `StrategyRegistry` بـ`Map`؛ آخر تسجيل لنفس `id` يستبدل السابق (يتيح استبدال الاستراتيجية عبر الإعداد لاحقًا).
  3. `HaversineStrategy` فقط في v1، بنصف قطر `6371008.8` م (REQUIREMENTS §6)؛ تُقيَّد `h` إلى `[0,1]` لمنع `NaN` العائم.
  4. النقطة المطابقة (مسافة 0) ← الاتجاهان 0 لأن الاتجاه غير معرّف؛ عدا ذلك `finalBearing = (initialBearing(b,a)+180) mod 360`. الحالة المتضادة (antipodal) غير معرّفة الاتجاه.
  5. الوحدات في `src/core/units/converters.ts` دوال نقية فقط (m↔km · m↔nm=1852 · m↔mi=1609.344 · m↔ft=0.3048)؛ لا نصوص واجهة في `core` (ADR-004/008)، والتنسيق في P4.
  6. `computePath(points, strategy)` يقبل `DistanceStrategy` ويعيد `segments` + `totalMeters`؛ أقل من نقطتين ← نتيجة فارغة.
  7. اختبارات مرجعية من GeographicLib 2.1 WGS84 في `tests/fixtures/geodesic-reference.json`: ويلينغتون→سالامانكا `19,959,679.267` م (فرق Haversine المرصود `+0.0387%`)، وبكين→سان فرانسيسكو `9,513,998` م واتجاهات `42.91642°/138.89027°` (فرق الاتجاه المرصود `0.033°/0.024°`)؛ حد المسافة `0.5%`.
- **تصحيحات على مسودة المالك:** استيراد `GeoPoint` واستخدام `import type`؛ إزالة حرف دخيل من `registry.ts`؛ حالة النقطة المطابقة (اتجاه 0 بدل 180)؛ تقييد `h`؛ إزالة `formatDistance` العربية من `core`؛ استبدال الحدود الفضفاضة بـfixtures؛ إضافة اختبارات Registry وحماية `computePath`.
- **البدائل المرفوضة:** تنفيذ Vincenty في v1 (غير مطلوب الآن) · حساب 3D chord (خارج نطاق v1) · تنسيق الوحدات بنصوص عربية داخل `core` (مخالفة ADR-004) · حدود اختبار فضفاضة بلا fixtures.
- **الأثر:** `src/core/geo/{strategy,registry,haversine,path}.ts` · `src/core/units/converters.ts` · `tests/measure.test.ts` · `tests/units.test.ts` · `tests/fixtures/geodesic-reference.json` · مفتاح `measure.method.haversine` في `ar.json`/`en.json`. يُفعّل ADR-016 عمليًا.

## ADR-033 — العرض البصري على الكرة: Pins + Polylines + ResultsPanel + Camera ✅ (2026-10-20 — P4)
- **السياق:** P3 وفّرت محرك القياس النقي، لكن النقاط تُرسم كنقاط بسيطة بلا خطوط ولا لوحة نتائج. P4 تحوّل المحرك إلى تجربة مرئية. اعتمد المالك تفصيل T4.1–T4.4 (الجلسة 17)، وهذا القرار يثبّت التفاصيل التقنية والانحرافات عن المسودة.
- **القرار:**
  1. **T4.1:** دبابيس `Billboard` مولّدة كـSVG Data URI في `pinImage.ts` (بلا أصول خارجية) بألوان متناوبة ورقم؛ النقطة المختارة بحلقة بيضاء وتكبير. النقاط بلا `height` تُرسم بـ`HeightReference.CLAMP_TO_GROUND`، وبلا `disableDepthTestDistance: Infinity` حتى تُحجب خلف الكرة.
  2. **التلميح:** لا يُستخدم `Entity.description` لأنه لا يظهر عند التمرير (InfoBox عند التحديد فقط)؛ بديله `usePointHover` (`MOUSE_MOVE` + `scene.pick`) + `PointTooltip` overlay داخل `MapView`، بلا Cesium في مكوّن الواجهة.
  3. **T4.2:** `selectedSegmentIndex` في المخزن (الفهرس لا يكفي فيه `selectedPointId` لأن النقطة تلامس مقطعين) + `usePathEntities` يرسم `Polyline` لكل مقطع بـ`ArcType.GEODESIC` و`clampToGround: true`؛ المحدد أحمر عرض 5 وغيره أزرق عرض 3.
  4. **T4.3:** `ResultsPanel` قسم مستقل في `Sidebar` (وليس داخل `PointsTools`)؛ يحسب `computePath` بـ`HaversineStrategy` ويعرض المقاطع والاتجاهين والإجمالي واسم المنهجية (FR-14)؛ زر وحدات (م/كم/nm، الافتراضي كم) والتنسيق في `resultsFormat.ts` النقي، والأرقام `dir="ltr"`. عُرِّض الشريط الجانبي إلى 320px لاستيعاب الجدول.
  5. **T4.4:** `useFlyTo` يكتشف النقطة المضافة بمقارنة المعرّفات (يتجاهل التعديل/الحذف/الترتيب وأول تحميل) ويؤطّرها مع السابقة إن وُجدت: منتصف جغرافي مع معالجة خط التاريخ + ارتفاع `max(2000, المسافة×1.2)`؛ طلب القائمة يبقى كما هو بمدة 1.5s.
- **تصحيحات على مسودة المالك:** رقم القرار 033 (التالية بعد 032) · `Entity.description` لا يحقق التلميح عند التمرير · لوحة النتائج خارج `PointsTools` · تحديد المقطع بفهرس مستقل · تأطير النقطة مع السابقة بدل ارتفاع ثابت 2 كم · إصلاح غياب ارتفاع النقاط تحت التضاريس.
- **البدائل المرفوضة:** صور دبابيس ثنائية الأبعاد مرفقة (وزن وصيانة) · InfoBox المدمج (نقر لا تمرير) · تمييز المقطع من `selectedPointId` (التباس مقطعين) · `disableDepthTestDistance: Infinity` (إظهار ما خلف الكرة).
- **الأثر:** `src/features/map/{pinImage,usePointHover,PointTooltip,pathGeometry,usePathEntities,usePointEntities,MapView,useFlyTo}.ts(x)` · `src/features/points/{ResultsPanel,resultsFormat}.tsx` · `src/store/usePointsStore.ts` · `src/components/Sidebar.tsx` · `src/index.css` · `ar.json`/`en.json` · اختبارات جديدة. `src/core/**` بلا تغيير.

## ADR-034 — المضلع والمساحة: حالة مشتركة + مقارنة جيوديسية/UTM ✅ (2026-10-20 — P5)
- **السياق:** FR-9 يفرض رسم مضلع وعرض مساحتين (GeographicLib وUTM+Shoelace) مع نسبة الفرق. مسودة المالك اقتصرت على `usePolygonDraw`، لكن المساحة والتصدير والجلسات تحتاج رؤوسًا مشتركة؛ كما أن `wgs84ToUtm` يستنتج منطقة لكل نقطة فلا يصلح لمساحة موحدة. REQUIREMENTS §4 يذكر «الدقة المساحية Vincenty/Karney» خارج النطاق، بينما FR-9 يفرضها؛ اعتُمد FR-9 (الأخص) وبقي تأجيل ترقية **محرك المسافات**.
- **القرار:**
  1. الحالة في `src/store/usePolygonStore.ts` (`idle/drawing/closed` + رؤوس)، والهوكان الملموسان لـCesium في `features/map` (`usePolygonDraw`/`usePolygonEntities`) التزامًا بـARCHITECTURE §5؛ واجهة `PolygonTools` و`AreaComparison` في `features/polygon`.
  2. الإغلاق بالنقر على الرأس الأول (16px) أو زر الإغلاق عند ≥3 رؤوس؛ `Escape` يُغلق عند ≥3 وإلا يُلغي. المساحة تُعرض للمضلع المفتوح ضمنيًا مع شارة «مفتوح».
  3. المساحة الجيوديسية: `Geodesic.WGS84.Polygon()` + `Compute(false, true)` ثم `Math.abs`، وإهمال الارتفاع (سطح الإهليلج WGS84). سبب اختيار `sign=true`: اختبار الاتجاه أثبت أن `sign=false` تعيد متممة المساحة عند لف الرؤوس عكسيًا. المراجع من `pyproj 3.7.2 / PROJ 9.5.1` (خوارزمية Karney) في `tests/fixtures/area-reference.json`.
  4. مساحة UTM: منطقة centroid عبر `utmZoneFor`، وإسقاط موحد بـ`wgs84ToUtmInZone` جديد (بلا تحقق Easting/Northing)، ثم Shoelace. تعدد المناطق يُحسب مع تحذير؛ عبور خط التاريخ/نصف الكرة/الخروج من 80°S–84°N يوقف UTM مع سبب واضح بدل رقم مضلل.
  5. الوحدات: m²/ha/km²/ft²/acre/mi²، الافتراضي هكتار. الفرق يُعرض موقّعًا (`UTM أعلى/أقل`) مع شرح تشوه الإسقاط و`0.9996`.
- **البدائل المرفوضة:** `wgs84ToUtm` لكل رأس (اختلاط مناطق) · تنفيذ مساحة إهليلجية ذاتي · حساب UTM في الحالات الحدية رغم مضلليّته · عرض مساحة المضلع المفتوح كأنه مغلق بلا شارة.
- **الأثر:** `src/core/geo/{areaGeodesic,areaUtm}.ts` · `src/core/coords/utm.ts` · `src/core/units/{unitTypes,areaConverters}.ts` · `src/store/usePolygonStore.ts` · `src/features/map/{usePolygonDraw,usePolygonEntities}.ts` · `src/features/polygon/{PolygonTools,AreaComparison,areaFormat}.tsx` · `App/MapView/Sidebar` · `index.css` · i18n · اختبارات وfixtures.

## ADR-035 — الجلسات والتصدير والإعدادات: Dexie + لقطة جلسة + auto-save ✅ (2026-10-20 — P6)
- **السياق:** FR-10/11 وNFR-3 تتطلبان تخزينًا محليًا خلف Repository، تصديرًا بثلاث صيغ، وإعدادات عرض. Dexie معتمد مبدأً (ADR-013)، لكن يلزم تثبيت المخطط وسياسة الحفظ والاستعادة، وفصل لغة الواجهة عن لقطة الجلسة لتجنب وميض/تبديل غير متوقع.
- **القرار:**
  1. قاعدة `geo3d-measure`، مخطط v1: `sessions { id, name, createdAt, updatedAt, version, points[], polygon, settings }` و`settings` مفتاح `app` (الوحدات، صيغة الإحداثيات، `lastSessionId`). Repository Pattern + تحقق zod + أخطاء مرمزة.
  2. لقطة الجلسة تشمل النقاط والمضلع ووحدات العرض/صيغة الإحداثيات، **ولا** تشمل اللغة أو الكاميرا أو التحديدات. اللغة تبقى في `localStorage` للتهيئة الفورية؛ استعادة الكاميرا/`view` مؤجلة إلى P7.
  3. أول حفظ صريح يُنشئ الجلسة؛ بعدها auto-save بعد 800ms من التغيير، بلا إنشاء جلسات من فراغ. تُستعاد آخر جلسة تلقائيًا، ويُفرَّغ الحفظ المعلّق قبل تبديل الجلسة.
  4. تأطير البيانات المستعادة بـ`frameAll` (bbox مع معالجة خط التاريخ)، و`useFlyTo` يتجاهل الإضافة الجماعية لمنع طيرانين.
  5. التصدير من الحالة الحالية: GeoJSON RFC 7946 (WGS84 `[lon,lat]` + Polygon مغلق)، KML (XML escaping + `clampToGround` عند غياب الارتفاع)، CSV (RFC 4180 + UTF-8 BOM عند التنزيل). المُسلسلات النقية منفصلة عن تنزيل المتصفح.
  6. الإعدادات مركزية في `useSettingsStore`: مسافة m/km/mi/ft/nm، مساحة m²/ha/km²/ft²/acre/mi²، صيغة DD/DMS/UTM/MGRS (افتراضي km/ha/DD). تغيير الوحدة في اللوحة يحدّث الإعداد العام.
- **البدائل المرفوضة:** LocalStorage للسجلات (سعة/بنية) · لغة الجلسة داخل Dexie (وميض وتبديل غير متوقع) · auto-create لكل تغيير (فوضى جلسات) · استعادة الكاميرا في P6 (خارج FR-11 وتعقيد bbox/orientation) · مكتبة تصدير خارجية (الصيغ مباشرة).
- **الأثر:** `src/lib/dexie.ts` · `src/services/{sessionRepository,settingsRepository,exportFormat,exportService}.ts` · `src/store/{useSessionStore,useSettingsStore}.ts` · `src/features/sessions/*` · `src/features/settings/SettingsPanel.tsx` · `src/features/export/ExportPanel.tsx` · `src/core/coords/formatPoint.ts` · `src/core/units/areaConverters.ts` · `App/Sidebar/MapView` · `usePointsStore`/`useFlyTo` · `tsconfig.node.json` · `package.json` · i18n · اختبارات.
- **التحقق (الجلسة 19):** المخطط الفعلي `sessions: 'id, updatedAt'` و`settings: 'key'`؛ سجل الجلسة `{ id, name, createdAt, updatedAt, version: 1, points, polygon: { vertices, closed }, settings }`؛ سجل الإعدادات `{ key: 'app', distanceUnit, areaUnit, coordinateFormat, lastSessionId, updatedAt }`. auto-save 800ms بعد أول حفظ صريح، واستعادة آخر جلسة مع `frameAll`. التصدير: GeoJSON `[lon,lat]` وحلقة مغلقة، KML مع `clampToGround` لغياب الارتفاع و`absolute` عند وجوده، CSV RFC 4180 + BOM عند التنزيل. 190/190 اختبارًا وبناء ناجح.

## ADR-036 — بوابة الإتاحة: axe-core في jsdom + فحص يدوي للتباين والخريطة ✅ (2026-10-21 — T7.1)
- **السياق:** NFR-7 يطلب تباينًا مقبولًا ودعم RTL/LTR، وP7 تحتاج بوابة إتاحة قابلة للتكرار. لا توجد اختبارات DOM سابقة، وVitest يعمل في Node فقط. اختبار `expect(true)` لا يثبت شيئًا.
- **القرار:**
  1. اختبار إتاحة حقيقي بـ`axe-core` داخل `jsdom` عبر `@testing-library/react`، على وسوم WCAG A/AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`).
  2. نطاق الاختبار: `Header + Sidebar` (بلا Cesium) في AR/RTL وEN/LTR، مع نقاط ومضلع لتفعيل الجداول والنماذج. تُهيأ i18n و`fake-indexeddb` في الملف.
  3. `color-contrast` معطّلة في jsdom لغياب محرك التخطيط/الرسم؛ تُفحص يدويًا في T7.3 وA-11. خريطة Cesium كذلك (WebGL غير متاح في jsdom).
  4. `tsconfig.node.json` يصبح `strict` + `jsx: react-jsx` + شمول `.tsx`؛ Vitest يشمل `.test.{ts,tsx}` ويضيف تغطية v8 بلا عتبات مبدئية.
- **البدائل المرفوضة:** اختبار placeholder (`expect(true)`) · Playwright الآن (تنزيل متصفح ثقيل وإضافة طبقة E2E كاملة قبل الحاجة) · اختبار Cesium/التباين في jsdom (نتائج مضللة) · تعطيل axe كليًا عند أول انتهاك (أُصلح الانتهاك فعليًا).
- **الأثر:** `tests/accessibility.test.tsx` · `tests/e2e/manual-scenarios.md` · `vitest.config.ts` · `tsconfig.node.json` · `package.json` · إصلاح `ResultsPanel`/`ar.json`/`en.json` ليطابق `aria-label` النص المرئي (WCAG 2.5.3).
- **التحقق (الجلسة 20):** 192/192 · axe أخضر في الحالتين · تغطية 55.85% statements · lint/format/build خضراء.

## ADR-037 — الأداء: Rolldown codeSplitting + تحميل Cesium كسولًا ✅ (2026-10-21 — T7.2)
- **السياق:** R-1/NFR-1: Cesium يمثل معظم الحزمة (4.17MB خام). مخطط أولي اقترح `manualChunks` ككائن، لكن Vite 8.3 يعمل على Rolldown ولا يدعم صيغة الكائن، و`rollupOptions` أصبح مهجورًا.
- **القرار:**
  1. التقسيم عبر `build.rolldownOptions.output.codeSplitting.groups` بأربع مجموعات: `cesium` · `react` · `i18n` · `vendor` (zustand/zod/proj4/mgrs/dexie/geographiclib).
  2. `MapView` يُحمَّل بـ`lazy()` + `Suspense` مع `MapLoading`، فيبقى الهيكل والأدوات قابلين للاستخدام قبل تحميل Cesium.
  3. فصل `LayerState`/`DEFAULT_LAYER_STATE` إلى `layerState.ts` بلا Cesium؛ استيرادهما من `useCesiumViewer` كان يجعل Cesium ضمن الرسم الثابت لحزمة الدخول.
- **البدائل المرفوضة:** `manualChunks` ككائن (غير مدعوم في Rolldown) · الاكتفاء بتقسيم chunks بلا lazy (لا يحسّن الإقلاع) · lazy للشريط الجانبي كله (يكسر أدوات الإدخال الفورية) · رفع `chunkSizeWarningLimit` لإخفاء التحذير.
- **الأثر:** `vite.config.ts` · `src/app/App.tsx` · `src/features/map/{MapLoading,layerState}.ts(x)` · `MapView`/`LayerSelector`/`useCesiumViewer` · `index.css` · `ar.json`/`en.json`.
- **التحقق (الجلسة 21):** الحزمة الأولية 208.8KB gzip (كانت 1.34MB) · Cesium 1118.6KB gzip كسول وغير موجود في `index.html` · 192/192 · preview/headless سليمان.

---

## قالب قرار جديد (انسخه عند الحاجة)
```md
## ADR-0xx — العنوان 🕓/✅ (YYYY-MM-DD)
- **السياق:** ...
- **القرار:** ...
- **البدائل:** ...
- **الأثر:** ...
```
