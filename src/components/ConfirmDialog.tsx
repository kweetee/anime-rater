import { useEffect } from 'react'
import { BUTTON_DANGER_CLASSES, BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  onConfirm: () => void
  onCancel: () => void
}

// Окно подтверждения опасного действия (удаления)
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Удалить',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Escape закрывает окно
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    // Клик по тёмному фону закрывает окно
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="frame w-full max-w-sm space-y-4 bg-white p-5 [--fw:3px] dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={BUTTON_SECONDARY_CLASSES}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className={BUTTON_DANGER_CLASSES}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
