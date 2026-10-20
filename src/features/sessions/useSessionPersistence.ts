import { useEffect, useMemo, useState } from 'react'
import {
  captureSessionSnapshot,
  restoreLastSession,
  saveSessionSnapshot,
} from '@/services/sessionService.ts'
import {
  loadAppSettings,
  saveAppSettings,
} from '@/services/settingsRepository.ts'
import {
  sessionSignature,
  useSessionSnapshot,
} from '@/store/sessionSnapshot.ts'
import { useSessionStore } from '@/store/useSessionStore.ts'
import { useSettingsStore } from '@/store/useSettingsStore.ts'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown'
}

/**
 * إقلاع التخزين (T6.2 — ADR-035):
 * - تحميل إعدادات التطبيق ثم آخر جلسة.
 * - حفظ الإعدادات بعد تغييرها.
 * - حفظ تلقائي للجلسة الحالية بعد أول حفظ صريح (debounce 800ms).
 */
export function useSessionPersistence(): void {
  const snapshot = useSessionSnapshot()
  const signature = useMemo(() => sessionSignature(snapshot), [snapshot])
  const sessionId = useSessionStore((state) => state.id)
  const lastSavedSignature = useSessionStore(
    (state) => state.lastSavedSignature,
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const settings = await loadAppSettings()
        if (cancelled) {
          return
        }
        useSettingsStore.getState().hydrate(settings)
        await restoreLastSession()
      } catch (error) {
        if (!cancelled) {
          useSessionStore.getState().markError(errorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const distanceUnit = useSettingsStore((state) => state.distanceUnit)
  const areaUnit = useSettingsStore((state) => state.areaUnit)
  const coordinateFormat = useSettingsStore((state) => state.coordinateFormat)

  useEffect(() => {
    if (!ready) {
      return
    }
    const timer = window.setTimeout(() => {
      void saveAppSettings({ distanceUnit, areaUnit, coordinateFormat }).catch(
        (error: unknown) => {
          useSessionStore.getState().markError(errorMessage(error))
        },
      )
    }, 300)
    return () => window.clearTimeout(timer)
  }, [areaUnit, coordinateFormat, distanceUnit, ready])

  useEffect(() => {
    if (!ready || !sessionId || !lastSavedSignature) {
      return
    }
    if (signature === lastSavedSignature) {
      return
    }

    const timer = window.setTimeout(() => {
      const current = captureSessionSnapshot()
      const currentSignature = sessionSignature(current)
      const session = useSessionStore.getState()
      if (!session.id || currentSignature === session.lastSavedSignature) {
        return
      }

      session.markSaving()
      void saveSessionSnapshot({
        id: session.id,
        name: session.name,
        snapshot: current,
        signature: currentSignature,
      }).catch((error: unknown) => {
        if (useSessionStore.getState().id === session.id) {
          useSessionStore.getState().markError(errorMessage(error))
        }
      })
    }, 800)

    return () => window.clearTimeout(timer)
  }, [lastSavedSignature, ready, sessionId, signature])
}
