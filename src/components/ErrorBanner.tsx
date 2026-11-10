import { CrossIcon } from './Doodles'

interface ErrorBannerProps {
  kind?: 'error' | 'success'
  children: React.ReactNode
  onClose?: () => void
}

// Единое сообщение для ошибок и успеха: ошибка с толстой чёрной линией слева, успех с серой
export function ErrorBanner({ kind = 'error', children, onClose }: ErrorBannerProps) {
  const isError = kind === 'error'
  const colors = isError
    ? 'border-slate-900 bg-slate-100 text-slate-900 dark:border-white dark:bg-slate-800 dark:text-slate-100'
    : 'border-slate-400 bg-transparent text-slate-700 dark:text-slate-300'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 border-l-4 p-3 text-sm ${colors}`}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          aria-label="Закрыть сообщение"
          className="-m-2 flex min-h-11 min-w-11 shrink-0 items-center justify-center"
          onClick={onClose}
        >
          <CrossIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
