import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteSessionById,
  listSavedSessions,
  loadSessionIntoStores,
  saveCurrentSession,
  startNewSession,
  captureSessionSnapshot,
} from '@/services/sessionService.ts'
import type { SessionSummary } from '@/services/sessionTypes.ts'
import {
  sessionSignature,
  useSessionSnapshot,
} from '@/store/sessionSnapshot.ts'
import { useSessionStore } from '@/store/useSessionStore'

/**
 * إدارة الجلسات (T6.2 — ADR-035):
 * حفظ صريح/جلسة جديدة/فتح/حذف بخطوتين، مع حالة حفظ وتغييرات غير محفوظة.
 */
export function SessionManager() {
  const { t, i18n } = useTranslation()
  const sessions = useSessionStore((state) => state)
  const snapshot = useSessionSnapshot()
  const signature = useMemo(() => sessionSignature(snapshot), [snapshot])
  const [draftName, setDraftName] = useState<string | null>(null)
  const [savedSessions, setSavedSessions] = useState<SessionSummary[]>([])
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [operationError, setOperationError] = useState<string | null>(null)

  // اسم المتجر هو المصدر، ويُستخدم المسودة فقط أثناء الكتابة.
  const effectiveName = draftName ?? sessions.name

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const list = await listSavedSessions()
      setSavedSessions(list)
    } catch {
      setOperationError(t('sessions.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const list = await listSavedSessions()
        if (!cancelled) {
          setSavedSessions(list)
        }
      } catch {
        if (!cancelled) {
          setOperationError(t('sessions.loadError'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [t])

  useEffect(() => {
    if (sessions.status !== 'saved' || !sessions.id) {
      return
    }
    let cancelled = false

    void (async () => {
      try {
        const list = await listSavedSessions()
        if (!cancelled) {
          setSavedSessions(list)
        }
      } catch {
        if (!cancelled) {
          setOperationError(t('sessions.loadError'))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sessions.id, sessions.status, t])

  const defaultName = effectiveName.trim() || t('sessions.untitled')
  const nameDirty = sessions.id !== null && defaultName !== sessions.name
  const dirty =
    sessions.id !== null &&
    (nameDirty ||
      (sessions.lastSavedSignature !== null &&
        signature !== sessions.lastSavedSignature))

  const persistCurrentIfDirty = async (): Promise<void> => {
    const current = useSessionStore.getState()
    if (!current.id || !current.lastSavedSignature) {
      return
    }
    const currentSignature = sessionSignature(captureSessionSnapshot())
    if (
      currentSignature !== current.lastSavedSignature ||
      defaultName !== current.name
    ) {
      await saveCurrentSession(defaultName)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (busy) {
      return
    }
    setBusy(true)
    setOperationError(null)
    try {
      await saveCurrentSession(defaultName)
      setDraftName(null)
      await refresh()
    } catch {
      setOperationError(t('sessions.saveError'))
    } finally {
      setBusy(false)
    }
  }

  const handleNew = async (): Promise<void> => {
    if (busy) {
      return
    }
    setBusy(true)
    setOperationError(null)
    try {
      await persistCurrentIfDirty()
      await startNewSession()
      setDraftName(null)
      setPendingDeleteId(null)
      await refresh()
    } catch {
      setOperationError(t('sessions.saveError'))
    } finally {
      setBusy(false)
    }
  }

  const handleOpen = async (id: string): Promise<void> => {
    if (busy) {
      return
    }
    setBusy(true)
    setOperationError(null)
    try {
      if (id !== useSessionStore.getState().id) {
        await persistCurrentIfDirty()
      }
      const record = await loadSessionIntoStores(id)
      if (!record) {
        setOperationError(t('sessions.notFound'))
        await refresh()
        return
      }
      setDraftName(null)
      setPendingDeleteId(null)
    } catch {
      setOperationError(t('sessions.loadError'))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (busy) {
      return
    }
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id)
      return
    }

    setBusy(true)
    setOperationError(null)
    try {
      await deleteSessionById(id)
      if (useSessionStore.getState().id === null) {
        setDraftName(null)
      }
      setPendingDeleteId(null)
      await refresh()
    } catch {
      setOperationError(t('sessions.deleteError'))
    } finally {
      setBusy(false)
    }
  }

  const statusText = (): string => {
    if (busy || sessions.status === 'saving') {
      return t('sessions.saving')
    }
    if (sessions.status === 'error') {
      return t('sessions.saveError')
    }
    if (sessions.id === null) {
      return t('sessions.unsaved')
    }
    return dirty ? t('sessions.dirty') : t('sessions.saved')
  }

  return (
    <section className="session-manager" aria-label={t('sessions.title')}>
      <h2 className="sidebar-title">{t('sessions.title')}</h2>

      <label className="settings-field">
        <span>{t('sessions.nameLabel')}</span>
        <input
          type="text"
          dir="auto"
          value={effectiveName}
          maxLength={120}
          placeholder={t('sessions.namePlaceholder')}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleSave()
            }
          }}
        />
      </label>

      <div className="session-actions">
        <button
          type="button"
          className="sidebar-tool"
          disabled={busy || sessions.status === 'saving'}
          onClick={() => void handleSave()}
        >
          {t('sessions.save')}
        </button>
        <button
          type="button"
          className="points-action"
          disabled={busy}
          onClick={() => void handleNew()}
        >
          {t('sessions.new')}
        </button>
      </div>

      <p
        className={
          sessions.status === 'error' || operationError
            ? 'session-status session-status--error'
            : 'session-status'
        }
        role="status"
      >
        {statusText()}
      </p>

      <ul className="session-list">
        {savedSessions.map((session) => {
          const isCurrent = sessions.id === session.id
          const isPendingDelete = pendingDeleteId === session.id
          return (
            <li
              key={session.id}
              className={
                isCurrent
                  ? 'session-item session-item--current'
                  : 'session-item'
              }
            >
              <div className="session-item__body">
                <span className="session-item__name">
                  {session.name}
                  {isCurrent && (
                    <span className="session-current-badge">
                      {t('sessions.current')}
                    </span>
                  )}
                </span>
                <span className="session-item__meta">
                  {t('sessions.pointCount', {
                    count: session.pointCount,
                  })}
                  {' · '}
                  {new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'ar', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(session.updatedAt)}
                </span>
              </div>
              <div className="session-item__actions">
                <button
                  type="button"
                  className="points-action"
                  disabled={busy || isCurrent}
                  onClick={() => void handleOpen(session.id)}
                >
                  {t('sessions.open')}
                </button>
                <button
                  type="button"
                  className={
                    isPendingDelete
                      ? 'points-action session-delete-confirm'
                      : 'points-action'
                  }
                  disabled={busy}
                  onClick={() => void handleDelete(session.id)}
                >
                  {isPendingDelete
                    ? t('sessions.deleteConfirm')
                    : t('sessions.delete')}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {loading && <p className="points-hint">{t('sessions.loading')}</p>}
      {!loading && savedSessions.length === 0 && (
        <p className="points-hint">{t('sessions.empty')}</p>
      )}
      {operationError && (
        <p className="points-error" role="alert">
          {operationError}
        </p>
      )}
    </section>
  )
}
