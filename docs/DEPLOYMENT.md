# DEPLOYMENT.md — نشر Geo3D Measure v1.0

> **الهدف:** نشر نسخة الإنتاج على HTTPS (إلزامي لـGPS) مع رؤوس أمان وكاش صحيح للأصول.
> **المسار المعتمد:** Vercel. **البديل الموثق:** Nginx على خادم Linux.

## 1) المتطلبات
- Node.js **22.12+** أو **24 LTS** (Vite 8 لا يعمل على إصدارات أقدم).
- npm مع `package-lock.json` (استخدم `npm ci` في CI/النشر).
- توكن **Cesium ion** صالح (لتضاريس World Terrain).
- نطاق HTTPS (Vercel يوفره تلقائيًا، أو شهادة Let's Encrypt على Nginx).

### متغيرات البيئة
| المتغير | إلزامي | الوصف |
|---|---|---|
| `VITE_CESIUM_ION_TOKEN` | نعم | توكن Cesium ion للتضاريس. |

> ⚠️ **كل متغير يبدأ بـ`VITE_` يُضمَّن نصًا في حزمة المتصفح ويمكن قراءته.** لا تضع كلمات مرور أو مفاتيح سرية في `VITE_*`. توكن ion عام بطبيعته؛ أنشئ توكنًا مخصصًا للإنتاج وقيّده من لوحة ion (النطاق/الأصول) بدل استخدام التوكن الافتراضي.
>
> التوكن يُقرأ **وقت البناء**، وليس وقت التشغيل. بعد تغييره أعد البناء والنشر.

## 2) البناء المحلي والتحقق
```bash
npm ci
cp .env.example .env        # ثم ضع التوكن الحقيقي في .env (غير مرفوع إلى Git)
npm run lint
npm run format:check
npm test -- --run
npm run build
npm run preview -- --port 4185
```
- الناتج في `dist/`، ويشمل `dist/cesiumStatic/` (Assets/Workers/Widgets) التي ينسخها `vite-plugin-static-copy`.
- افتح `http://localhost:4185/` وتأكد من ظهور الكرة والتضاريس بلا أخطاء Console.
- `npm run preview` لا يصلح للإنتاج الدائم؛ هو للتحقق فقط.

## 3) النشر على Vercel (المسار المعتمد)

### 3.1 عبر لوحة Vercel
1. ارفع المستودع إلى GitHub/GitLab/Bitbucket.
2. في Vercel: **Add New → Project** واختر المستودع.
3. الإعدادات:
   - **Framework Preset:** Vite
   - **Root Directory:** `.`
   - **Install Command:** `npm ci`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Node.js Version:** 22.x (أو 24.x)
4. **Environment Variables:** أضف `VITE_CESIUM_ION_TOKEN` لكل من Production وPreview (وأضف `Development` إن استخدمت `vercel dev`).
5. اضغط **Deploy**.
6. اربط النطاق المخصص من **Settings → Domains** (شهادة HTTPS تلقائية).

### 3.2 عبر Vercel CLI
```bash
npm i -g vercel
vercel link
vercel env add VITE_CESIUM_ION_TOKEN production
vercel env add VITE_CESIUM_ION_TOKEN preview
vercel --prod
```

### 3.3 `vercel.json` (يُضاف في T7.5)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(self), camera=(), microphone=()"
        },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/cesiumStatic/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, stale-while-revalidate=604800"
        }
      ]
    },
    {
      "source": "/",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    },
    {
      "source": "/index.html",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```
**ملاحظات:**
- **لا rewrite عام:** التطبيق بلا React Router؛ `/` وملفات الأصول تكفي. إضافة rewrite لكل المسارات قد تخفي أخطاء 404 مستقبلًا.
- أصول `/assets/*` تحمل بصمة hash، لذا `immutable` آمنة. `cesiumStatic` غير مبصومة؛ استخدم كاشًا قصيرًا (يومًا) لتفادي تعارض العاملين (Workers) بعد الترقية.
- `index.html` بلا كاش حتى يلتقط المتصفح أسماء الأصول الجديدة.
- `Permissions-Policy: geolocation=(self)` ضرورية لعمل GPS على النطاق نفسه.
- **CSP:** لا تُفعّلها مباشرة في أول نشر. Cesium يحتاج عادةً `worker-src blob:` و`wasm-unsafe-eval` وصورًا من نطاقات Esri/ion و`data:`/`blob:`؛ ابدأ بـ`Content-Security-Policy-Report-Only` وراقب التقارير ثم فعّل السياسة.

### 3.4 تقييد توكن Cesium ion
1. من [ion.cesium.com](https://ion.cesium.com) → **Access Tokens** أنشئ توكنًا مخصصًا لـGeo3D Measure (لا تستخدم التوكن الافتراضي).
2. امنحه أقل الصلاحيات اللازمة: قراءة أصل التضاريس **World Terrain (asset 1)** فقط إن أمكن.
3. قيّد النطاقات/الـreferrers المسموحة بنطاق الإنتاج (`https://your-domain.com`) حسب الخيارات المتاحة في اللوحة.
4. ضع التوكن في Vercel Environment Variables، ولا تضعه في Git.

## 4) النشر على Nginx (بديل)

### 4.1 بناء النسخة
```bash
git clone <repo> /var/www/geo3d-measure
cd /var/www/geo3d-measure
npm ci
printf 'VITE_CESIUM_ION_TOKEN=%s\n' '<TOKEN>' > .env
npm run build
```
> احتفظ بنسخة احتياطية من `dist` السابق قبل كل نشر (مثال: `dist-$(date +%Y%m%d%H%M)`).

### 4.2 إعداد Nginx
```nginx
server {
    listen 80;
    server_name measure.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name measure.example.com;

    root /var/www/geo3d-measure/dist;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/measure.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/measure.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "geolocation=(self), camera=(), microphone=()" always;
    add_header Cross-Origin-Opener-Policy same-origin always;
    # فعّل HSTS فقط بعد التأكد من استقرار HTTPS:
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # التطبيق بلا Router؛ fallback للجذر فقط عند الحاجة
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;                       # index.html بلا كاش
    }

    location /assets/ {
        expires 1y;                       # أسماء مبصومة بـhash
        access_log off;
    }

    location /cesiumStatic/ {
        expires 7d;                       # أصول Cesium غير مبصومة
        access_log off;
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml application/wasm;
}
```
- استخدم `certbot --nginx -d measure.example.com` لإصدار الشهادة وتجديدها.
- **لا تضع `add_header Cache-Control` داخل `location`** لأن `add_header` في المستوى الأب لا يُورَّث عند وجود `add_header` في المستوى الابن. استخدم `expires` كما أعلاه، وأبقِ رؤوس الأمان في مستوى `server`.
- إن أضفت CSP لاحقًا فاختبرها أولًا بوضع Report-Only (نفس ملاحظات Vercel).

## 5) التحقق بعد النشر
### 5.1 آلي
```bash
curl -I https://your-domain.com/
curl -I https://your-domain.com/assets/<hashed-file>.js
curl -I https://your-domain.com/cesiumStatic/Workers/createVerticesFromHeightmap.js
```
تحقق من:
- `HTTP/2 200` و`content-type` صحيح.
- `Permissions-Policy` و`X-Content-Type-Options` و`Referrer-Policy` موجودة.
- `cache-control: no-cache` لـ`/`، و`max-age=31536000` لأصول `/assets/`.
- شهادة TLS صالحة (بدون تحذيرات).

### 5.2 يدوي على المتصفح والهاتف
- [ ] الصفحة تفتح على HTTPS بلا أخطاء Console.
- [ ] الكرة والصور Esri والتضاريس تظهر (Network: بلاطات 200، لا 401/403 لتوكن ion).
- [ ] **GPS:** «موقعي الحالي» يعمل على هاتف حقيقي بعد السماح بالإذن.
- [ ] إضافة نقطة يدويًا وبالنقر وبالبحث.
- [ ] مسافة ومضلع ومساحتان وقيم الفرق.
- [ ] حفظ جلسة ← إعادة تحميل ← استعادة تلقائية.
- [ ] تصدير GeoJSON/KML/CSV وفتحها في QGIS/Google Earth/Excel.
- [ ] تبديل AR/EN وRTL/LTR على الموبايل.
- [ ] لا أخطاء 404 لأصول Cesium أو العاملين (Workers).

## 6) التراجع (Rollback)
- **Vercel:** Deployments → اختر النشر السابق → **Instant Rollback** (أو أعد نشر commit سابق).
- **Nginx:** استبدل `root` بمجلد `dist` الاحتياطي ثم `sudo nginx -t && sudo systemctl reload nginx`.
- بعد التراجع تحقق من فتح الصفحة وGPS والتصدير.

## 7) استكشاف الأخطاء
| العرض | السبب المحتمل | الحل |
|---|---|---|
| صفحة بيضاء | أصول 404 أو `base` خاطئ | انشر على جذر النطاق، وتحقق من `dist/index.html` ومسارات `/assets/`. |
| التضاريس لا تظهر | توكن مفقود/غير مقيد أو نُسي إعادة البناء | أضف `VITE_CESIUM_ION_TOKEN` ثم أعد البناء والنشر. |
| `401/403` من ion | توكن ملغى أو صلاحيات ناقصة | أنشئ توكنًا جديدًا وامنحه World Terrain. |
| الصور لا تظهر | حجب شبكة/جدار حماية لـEsri | جرّب شبكة أخرى؛ تحقق من `*.arcgisonline.com` في Console. |
| GPS مرفوض | HTTP أو `Permissions-Policy` تمنع self | استخدم HTTPS وتأكد من `geolocation=(self)`. |
| 404 عند تحديث مسار | rewrite ناقص (مستقبلًا مع Router) | أضف fallback لـ`index.html` عندما يُضاف Router. |
| أصول قديمة بعد الترقية | كاش `index.html` أو `cesiumStatic` | تأكد من `no-cache` للـindex، وأعد التحميل بقوة. |

## 8) قائمة قصيرة قبل الإطلاق
راجع `PRE_LAUNCH_CHECKLIST.md` بالكامل. لا يُعلن «منشورًا» ولا يُوسم `v1.0.0` قبل توقيع المالك والتحقق الحي.
