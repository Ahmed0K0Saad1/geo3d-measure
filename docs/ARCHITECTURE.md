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
      [Cesium ion: صور + تضاريس]   [Services: geocoding · storage · export]
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
| zustand | إدارة الحالة | Context API | مقترح (ADR-012) |
| dexie | IndexedDB | idb / LocalStorage | مقترح (ADR-013) |
| proj4 + mgrs | تحويلات UTM/MGRS | حسابات يدوية | مقترح (ADR-015) |
| zod | تحقق مدخلات الإحداثيات | Joi / Yup | مقترح |
| i18next + react-i18next | التعريب | حل مخصص | معتمد مبدأً (ADR-004) |
| vitest | الاختبارات | Jest | مقترح (ADR-016) |
| eslint + prettier | جودة الكود | — | مقترح |
| geographiclib-geodesic (أو مكافئ) | مساحة جيوديسية دقيقة | تنفيذ ذاتي | مقترح (ADR-017) |

## 3) شجرة الملفات المخططة
```
geo3d-measure/
├─ docs/                     # التوثيق الرسمي (مصدر الحقيقة)
│  ├─ STATE.md · ROADMAP.md · REQUIREMENTS.md · ARCHITECTURE.md · DECISIONS.md
├─ public/                   # أصول ثابتة (favicon، صور)
├─ src/
│  ├─ app/                   # تركيب التطبيق: App، Providers، التخطيط العام
│  ├─ components/            # مكونات UI عامة (Button، Input، Panel، Modal)
│  ├─ features/
│  │  ├─ map/                # CesiumViewer + الخطافات + الطبقات
│  │  ├─ points/             # إدخال وإدارة النقاط
│  │  ├─ measure/            # عرض نتائج القياس
│  │  ├─ polygon/            # رسم المضلع وعرض المساحة
│  │  ├─ export/             # واجهات التصدير
│  │  └─ settings/           # الإعدادات
│  ├─ core/                  # منطق خالص بلا React ولا Cesium
│  │  ├─ geo/                # المسافات/الاتجاه/المساحة + الاستراتيجيات
│  │  ├─ coords/             # parsers DD/DMS/UTM/MGRS + التحويلات
│  │  └─ units/              # التحويل والعرض
│  ├─ services/              # geocoding · storage (Repository) · تصدير ملفات
│  ├─ store/                 # Zustand
│  ├─ i18n/                  # الإعداد + ar.json / en.json
│  ├─ types/                 # أنواع TS مشتركة
│  └─ lib/                   # مساعدات (debounce، تنسيق أرقام)
├─ tests/                    # Vitest + fixtures مرجعية
├─ .env.example · .gitignore · AGENTS.md · README.md
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
- `areaGeodesic(points)`: عبر GeographicLib `PolygonArea` (دقة إهليلجية).
- `areaUtm(points)`: إسقاط إلى UTM (منطقة تؤخذ من centroid) ثم Shoelace — مع تحذير عند امتداد المضلع لأكثر من منطقة UTM.
- الواجهة تعرض القيمتين + الفرق النسبي مع شرح مبسط.

### 4.3 سياسة الدقة المعروضة
- كل نتيجة تحمل شارة المنهجية: "Haversine — WGS84 كروي تقريبي".
- توثيق الفرق النظري حتى ~0.5% مقارنة بالإهليلجي داخل الواجهة والتوثيق.

## 5) تكامل Cesium
- `useCesiumViewer(container)`: يدير دورة الحياة (إنشاء/تدمير العارض).
- مزامنة الكيانات: effect مركزي يقرأ الـStore ويحدّث EntityCollection (نقاط/خطوط/مضلع) — بدون إعادة إنشاء العارض.
- الصور والتضاريس من Cesium ion عبر `VITE_CESIUM_ION_TOKEN`.
- رسم المسار: Polyline (يتبع سطح الأرض بسلوك Cesium الافتراضي للخطوط الجيوديسية).

## 6) Geocoding
- الواجهة: `GeocoderProvider { search(query): Promise<GeoResult[]> }`.
- v1: Nominatim مع debounce ≥ 600ms واحترام حد الاستخدام + إسناد OpenStreetMap الظاهر.
- بديل جاهز للتبديل: Photon (بدون تغييرات في الواجهة الأمامية).

## 7) التخزين المحلي
- Dexie، مخطط v1:
  - `sessions`: `{ id, name, createdAt, updatedAt, points[], polygon?, view? }`
  - `settings`: key-value (اللغة، الوحدات، آخر جلسة مفتوحة).
- Repository: `listSessions/saveSession/loadSession/deleteSession` — يمكن استبداله لاحقًا بـHTTP دون تغيير الواجهة (ADR-005).

## 8) i18n و RTL
- i18next + react-i18next، ملفات `ar.json`/`en.json`، تبديل `dir` تلقائيًا.
- تنسيق الأرقام يتبع اللغة؛ نسخ الإحداثيات يكون دائمًا بالصيغة الدولية الموحدة.

## 9) استراتيجية الاختبارات
1. **وحدة (Vitest):** `core/` و`coords/` و`units/` بدون متصفح.
2. **مرجعية:** fixtures تُولَّد بـGeographicLib (مسافات/مساحات لمَواقع معيارية) وتُحفظ JSON في `tests/fixtures`.
3. **حدود نظرية:** اختبار أن فرق Haversine عن المرجع الإهليلجي داخل الحد الأقصى المتوقع.
4. **يدوي موثق:** سيناريوهات لكل مرحلة تُكتب في STATE.

## 10) المخاطر التقنية
مرجع R-1..R-5 في `ROADMAP.md`؛ التفاصيل الإضافية تُضاف هنا عند معالجتها.
