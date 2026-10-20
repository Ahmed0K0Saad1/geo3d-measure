import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

// إعداد مستقل لبيئة الاختبارات — لا يمس إعداد Vite الإنتاجي في vite.config.ts
// (alias `@/` مكرر هنا لأن vitest.config.ts لا يدمج vite.config.ts تلقائيًا)
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // الاختبارات المنطقية تعمل في Node؛ اختبارات الوصولية تُعلن jsdom محليًا
    // عبر `// @vitest-environment jsdom` كي لا تتأثر سرعة بقية الاختبارات.
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx'],
    },
  },
})
