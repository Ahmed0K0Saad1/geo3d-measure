/// <reference types="vite/client" />

// متغيرات البيئة الخاصة بالمشروع — تعريف صريح بلا any (قاعدة TypeScript الصارم)
interface ImportMetaEnv {
  readonly VITE_CESIUM_ION_TOKEN: string
}
