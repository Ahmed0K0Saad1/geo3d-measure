# STATE.md — لوحة حالة المشروع الحية

> **أول ملف يُقرأ في أي جلسة.** يُحدَّث بعد كل مهمة.

| البند | القيمة |
|---|---|
| آخر تحديث | 2026-10-20 — الجلسة 10 |
| المرحلة الحالية | **P2 جارية — T2.2 مكتمل ☑ («موقعي الحالي» + أول عرض للنقاط على الكرة) — التالية: T2.3** |
| حالة المرحلة | ⏳ جارية — T2.1–T2.2 منفّذتان ومتحققتان |
| المهمة الجارية الآن | **لا مهمة جارية — T2.2 ملتزمة (الجلسة 10)؛ التالية: T2.3 بانتظار اعتماد البدء** |
| المهمة التالية | **T2.3 — إدخال يدوي DD/DMS + معاينة فورية** |
| إعاقات تقنية | لا يوجد |

## بنود معلّقة على المالك (Action Items)
| # | البند | مطلوب عند |
|---|---|---|
| A-1 | ✅ تم — الحساب أُنشئ والتوكن مستلم ومحفوظ في `.env` محلياً (خارج Git) — فحص ion API: HTTP 200 | مُغلق (2026-10-19) |
| A-2 | الفحص البصري لتوسعة T1.7 (تبديل 3 خرائط أساس · تسميات/تضاريس · AR/EN بلا أخطاء Console) | قبل إغلاق مراجعة P1 بصريًا |
| A-3 | الفحص اليدوي لزر «موقعي الحالي» وعلامة النقطة على الكرة في متصفح حقيقي (GPS + رفض الإذن) | مراجعة T2.2 |

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
