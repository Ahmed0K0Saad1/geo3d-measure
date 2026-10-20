import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// مجلد أصول Cesium الثابتة داخل الحزمة (Workers / ThirdParty / Assets / Widgets)
// (منقول من المثال الرسمي CesiumGS/cesium-vite-example مع تكييف لإصدار vite-plugin-static-copy 4)
const cesiumSource = 'node_modules/cesium/Build/Cesium'
// المجلد الذي تُنسخ إليه أصول Cesium ويُخدَم منه في التطوير والبناء معًا
const cesiumBaseUrl = 'cesiumStatic'
// الإصدار 4 من الـplugin يحفظ المسار الكامل للأصل داخل dest، لذا نُزيل مقاطع
// (node_modules/cesium/Build/Cesium) ليبقى اسم المجلد مباشرة تحت cesiumStatic
const cesiumStripBase = cesiumSource.split('/').length

// https://vite.dev/config/
export default defineConfig({
  define: {
    // يُخبر Cesium بمكان أصوله الثابتة في وقت التشغيل
    CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`),
  },
  build: {
    // Vite 8 يستخدم Rolldown: الصيغة الكائنية لـmanualChunks غير مدعومة،
    // والتقسيم الصحيح عبر codeSplitting.groups (T7.2 — R-1).
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'cesium',
              test: /node_modules[\\/](@cesium|cesium)[\\/]/,
            },
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            {
              name: 'i18n',
              test: /node_modules[\\/](i18next|react-i18next)[\\/]/,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/](zustand|zod|proj4|mgrs|dexie|geographiclib-geodesic)[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: `${cesiumSource}/ThirdParty`,
          dest: cesiumBaseUrl,
          rename: { stripBase: cesiumStripBase },
        },
        {
          src: `${cesiumSource}/Workers`,
          dest: cesiumBaseUrl,
          rename: { stripBase: cesiumStripBase },
        },
        {
          src: `${cesiumSource}/Assets`,
          dest: cesiumBaseUrl,
          rename: { stripBase: cesiumStripBase },
        },
        {
          src: `${cesiumSource}/Widgets`,
          dest: cesiumBaseUrl,
          rename: { stripBase: cesiumStripBase },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
