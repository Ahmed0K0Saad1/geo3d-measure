import { defineConfig } from 'vitest/config'

// إعداد مستقل لبيئة الاختبارات — لا يمس إعداد Vite الإنتاجي في vite.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
