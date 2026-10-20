# Geo3D Measure — قياس المسافات والمساحات على كرة أرضية 3D

تطبيق ويب تفاعلي بكرة أرضية ثلاثية الأبعاد (CesiumJS) لتثبيت نقاط في أي مكان بالعالم — بموقعك الحقيقي، أو بالإحداثيات، أو بالنقر، أو بالبحث — وقياس المسافات والمساحات بطرق جيوديسية موثقة، مع واجهة عربية/إنجليزية، حفظ محلي، وتصدير النتائج.

| البند | القيمة |
|---|---|
| الإصدار | **1.0.0** |
| الحالة | ✅ الميزات مكتملة — النشر على Vercel ضمن T7.5 |
| المالك | أحمد (مهندس نظم معلومات جغرافية) |
| آخر تحديث | 2026-10-21 (الجلسة 23 — T7.4) |
| النطاق | `docs/REQUIREMENTS.md` (v1.0) |

## الميزات
- **إدخال النقاط:** GPS · DD/DMS · UTM · MGRS · النقر على الخريطة · البحث عبر Nominatim/OpenStreetMap.
- **إدارة النقاط:** تسمية · حذف · إعادة ترتيب · تركيز الكاميرا · تلميح عند التمرير.
- **المسافات:** مسافة كل مقطع + الإجمالي + اتجاه البداية/النهاية، بمنهجية **Haversine (WGS84)** وشفافية كاملة.
- **المضلع والمساحة:** مساحة جيوديسية (GeographicLib) ومقارنة **UTM + Shoelace** مع نسبة الفرق والتحذيرات.
- **الجلسات:** حفظ/فتح/حذف محلي في IndexedDB، وحفظ تلقائي بعد أول حفظ، واستعادة آخر جلسة.
- **التصدير:** GeoJSON (RFC 7946) · KML · CSV (RFC 4180 + BOM).
- **الإعدادات:** وحدات المسافة/المساحة · صيغة الإحداثيات · اللغة (AR/RTL افتراضيًا وEN/LTR).
- **الإتاحة:** تباين AA · تنقل كامل بلوحة المفاتيح · أهداف لمس مناسبة · تخطيط موبايل متكيف.
- **الأداء:** Cesium يُحمَّل كسولًا في حزمة منفصلة؛ الحزمة الأولية أقل من 300KB gzip.

## البدء السريع
```bash
# المتطلب: Node.js 22.12+ أو 24 LTS
npm ci
cp .env.example .env        # ثم ضع توكن Cesium ion في .env
npm run dev
```
افتح `http://localhost:5173/`.

> **GPS:** يعمل على `localhost` أو HTTPS. على شبكة/رابط HTTP سيرفض المتصفح طلب الموقع.
>
> **التوكن:** `VITE_CESIUM_ION_TOKEN` مطلوب للتضاريس. كل متغير `VITE_*` يُضمَّن في حزمة المتصفح — لا تضع فيه أي سر. أنشئ توكن ion مخصصًا وقيّده بالنطاق.

## الأوامر
| الأمر | الغرض |
|---|---|
| `npm run dev` | خادم التطوير |
| `npm run build` | فحص TypeScript + بناء الإنتاج إلى `dist/` |
| `npm run preview` | معاينة بناء الإنتاج محليًا |
| `npm run lint` | Oxlint |
| `npm run format` / `format:check` | Prettier كتابة/فحص |
| `npm test` | Vitest (وضع المراقبة) |
| `npm test -- --run` | تشغيل الاختبارات مرة واحدة |
| `npm run test:coverage` | تقرير التغطية (v8) |

## التقنيات
CesiumJS 1.146 · React 19 · TypeScript 6 (strict) · Vite 8 (Rolldown) · Zustand 5 · Dexie 4 (IndexedDB) · proj4js + mgrs · geographiclib-geodesic · zod 4 · i18next/react-i18next · Vitest 5 + axe-core + Testing Library · Oxlint + Prettier.

## خريطة الوثائق
| # | الملف | الغرض |
|---|---|---|
| 1 | `docs/STATE.md` | الحالة اللحظية والمهمة التالية وسجل الجلسات — **اقرأه أولًا** |
| 2 | `docs/ROADMAP.md` | خطة المراحل والمهام ومعايير القبول |
| 3 | `docs/REQUIREMENTS.md` | المتطلبات المعتمدة v1.0 |
| 4 | `docs/ARCHITECTURE.md` | التصميم التقني والطبقات وشجرة الملفات |
| 5 | `docs/DECISIONS.md` | سجل القرارات المعمارية (ADR) |
| 6 | `docs/USER_GUIDE.md` | دليل المستخدم (عربي + English Quick Guide) |
| 7 | `docs/DEPLOYMENT.md` | النشر على Vercel وNginx والتحقق والتراجع |
| 8 | `docs/PRE_LAUNCH_CHECKLIST.md` | قائمة ما قبل الإطلاق والتوقيع |
| 9 | `AGENTS.md` | قواعد العمل لأي وكيل AI |

## هيكل المشروع (مختصر)
```
src/
├─ app/          # تركيب التطبيق (App)
├─ components/   # Header · Sidebar · LayerSelector
├─ features/     # map · points · polygon · sessions · export · settings
├─ core/         # geo · coords · units (منطق نقي بلا React/Cesium)
├─ services/     # geocoding · sessions · settings · export
├─ store/        # Zustand
├─ i18n/         # ar.json · en.json · التهيئة
├─ lib/          # dexie · validators · مساعدات
└─ types/        # تعريفات البيئة
tests/           # Vitest + fixtures مرجعية + axe
docs/            # التوثيق الرسمي
```
التفاصيل الكاملة في `docs/ARCHITECTURE.md` §3.

## الدقة والخصوصية
- **المسافات:** Haversine على كرة نصف قطرها 6371.0088 كم؛ الفرق عن الإهليلج WGS84 حتى ~0.5%. تظهر المنهجية مع كل نتيجة.
- **المساحات:** القيمة الجيوديسية مرجعية؛ UTM+Shoelace تتأثر بتشوه الإسقاط وتُوقف عند الحالات الحدية.
- **GPS:** دقة المتصفح (عادة 5–50م) منفصلة عن دقة الحساب.
- **البيانات:** النقاط والجلسات والإعدادات محلية في المتصفح فقط. نص البحث يُرسل إلى Nominatim/OpenStreetMap، والخرائط من Esri، والتضاريس من Cesium ion.
- **الاستخدام:** قياس عملي/تقديري، وليس بديلًا عن المساحة القانونية أو العقارية.

## النشر
راجع `docs/DEPLOYMENT.md`. المسار المعتمد: **Vercel** مع `vercel.json` (رؤوس أمان + `Permissions-Policy: geolocation=(self)` + كاش أصول). لا يُعلن الإطلاق ولا يُوسم `v1.0.0` قبل استكمال `docs/PRE_LAUNCH_CHECKLIST.md` وتوقيع المالك.

## قواعد التطوير
- كل قرار تقني يُرقَّم في `docs/DECISIONS.md`.
- `src/core/**` بلا React أو Cesium، وكل دالة حساب لها اختبار بقيمة مرجعية.
- النصوص عبر i18n فقط، ولا أسرار في الكود.
- كل مهمة تنتهي بتحديث `STATE.md`/`ROADMAP.md` والتزام Git واضح.
- التفاصيل الإلزامية في `AGENTS.md`.
