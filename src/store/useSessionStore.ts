import { create } from 'zustand'

export type SessionSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SessionState {
  id: string | null
  name: string
  createdAt: Date | null
  updatedAt: Date | null
  status: SessionSaveStatus
  error: string | null
  /** بصمة آخر لقطة حُفظت — أساس مؤشر «تغييرات غير محفوظة». */
  lastSavedSignature: string | null
  /** عدّاد يطلب تأطير كل البيانات بعد الاستعادة (T6.2). */
  fitAllToken: number
  hydrateSession: (input: {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    lastSavedSignature: string
  }) => void
  markSaving: () => void
  markSaved: (input: { updatedAt: Date; lastSavedSignature: string }) => void
  markError: (message: string) => void
  requestFitAll: () => void
  reset: () => void
}

/** حالة الجلسة الحالية وحالة حفظها — لا تحتفظ ببيانات النقاط نفسها. */
export const useSessionStore = create<SessionState>()((set) => ({
  id: null,
  name: '',
  createdAt: null,
  updatedAt: null,
  status: 'idle',
  error: null,
  lastSavedSignature: null,
  fitAllToken: 0,
  hydrateSession: (input) =>
    set({
      ...input,
      status: 'saved',
      error: null,
    }),
  markSaving: () => set({ status: 'saving', error: null }),
  markSaved: ({ updatedAt, lastSavedSignature }) =>
    set({ status: 'saved', updatedAt, lastSavedSignature, error: null }),
  markError: (message) => set({ status: 'error', error: message }),
  requestFitAll: () => set((state) => ({ fitAllToken: state.fitAllToken + 1 })),
  reset: () =>
    set({
      id: null,
      name: '',
      createdAt: null,
      updatedAt: null,
      status: 'idle',
      error: null,
      lastSavedSignature: null,
    }),
}))
