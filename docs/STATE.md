# STATE.md — لوحة حالة المشروع الحية

> **أول ملف يُقرأ في أي جلسة.** يُحدَّث بعد كل مهمة.

| البند | القيمة |
|---|---|
| آخر تحديث | 2026-10-19 — الجلسة 5 |
| المرحلة الحالية | **P1 — التهيئة التقنية (Scaffold)** |
| حالة المرحلة | ⏳ جارية — مكتمل: T1.1–T1.5 (ملتزمة) · T1.6 قيد التنفيذ |
| المهمة الجارية الآن | **T1.6 — الهيكل العام للواجهة + i18n أولي (معتمدة — قيد التنفيذ)** |
| المهمة التالية | **T2.1 — نموذج النقطة + مخزن Zustand** (بعد تفصيل P2 كاملة واعتمادها) |
| إعاقات تقنية | لا يوجد |

## بنود معلّقة على المالك (Action Items)
| # | البند | مطلوب عند |
|---|---|---|
| A-1 | ✅ تم — الحساب أُنشئ والتوكن مستلم ومحفوظ في `.env` محلياً (خارج Git) — فحص ion API: HTTP 200 | مُغلق (2026-10-19) |

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

## سجل الجلسات (الأحدث أولًا)
### الجلسة 5 — 2026-10-19 — T1.5: أول كرة أرضية حقيقية
- استلام توكن Cesium ion من المالك (A-1 ✅) وحفظه في `.env` محلياً — مؤكد أن Git يتجاهله (`git check-ignore`: `.gitignore:10`)، وصلاحية التوكن حيّة (`Ion API HTTP: 200`) دون طباعة القيمة.
- `useCesiumViewer` (وفق ARCHITECTURE §5): `Ion.defaultAccessToken` + `Viewer` مع `Terrain.fromWorldTerrain()` + إدارة دورة حياة آمنة مع StrictMode + استيراد `widgets.css`؛ `App` أصبح full-screen؛ `src/types/env.d.ts` يعرّف المتغير بلا any؛ حُذف سطر T1.2 المؤقت (بديله الدائم `tests/cesium.smoke.test.ts`).
- تحقق آلي: lint نظيف · format:check نظيف · test 3/3 · build ناجح (342 أصلاً؛ الحزمة 4.39 MB / gzip 1.19 MB — تحذير حجم القطعة متوقع ومسجَّل ضمن الخطر R-1) · dev-server: `/` و`widgets.css` والأصول وتحويلات main/App/hook كلها HTTP 200.
- **الفحص البصري (المحاولة 1) كشف عطلاً:** الكرة بلا صور. التشخيص بالأدلة: استجابة ion للأصل 2 = `{externalType:"BING"}` بلا `url` → كود Cesium 1.146 يوجّهها إلى `BingMapsImageryProvider.fromUrl` (عبر `IonImageryProviderFactory.BING`) → **Bing Maps for Enterprise متقاعدة** (404) → فشل طبقة الصور. التوكن والصلاحيات سليمة (الأصلان 1/2: HTTP 200) و**التضاريس تعمل** (`CesiumTerrainProvider.fromIonAssetId(1)`: نجح كاملاً). خط ArcGIS في الكونسول = عنصر داخل قائمة `BaseLayerPicker` الافتراضية (يتطلب مفتاحاً) وليس سبب العطل.
- **الإصلاح — ADR-020:** `baseLayerPicker: false` + صور أساسية من **Esri World Imagery** (خدمة REST بلا مفتاح — metadata وبلاطة فعلية وCORS: متحققة) + التضاريس تبقى من ion؛ الملف المتأثر: `useCesiumViewer.ts` (+ تحديث §5 في ARCHITECTURE وسطر T1.5 في ROADMAP).
- إعادة تحقق آلي بعد الإصلاح: lint نظيف · format:check نظيف · test 3/3 · build ناجح (342 أصلاً) · dev-server: `/` وhook و`widgets.css` بـHTTP 200.
- **الفحص البصري النهائي (صور + تضاريس + دوران/تقريب) مطلوب من المالك** لتوثيق السيناريو اليدوي.
- **الالتزام أُنشئ بموافقة المالك:** `feat(map): render real Cesium globe with Esri imagery and ion terrain (T1.5)` — والفحص البصري النهائي يُستكمل مع فحص T1.6.

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
