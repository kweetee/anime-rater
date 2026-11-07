interface ErrorBannerProps {
  kind?: 'error' | 'success'
  children: React.ReactNode
  onClose?: () => void
}

// Единое сообщение для ошибок (красное) и успеха (зелёное)
export function ErrorBanner({ kind = 'error', children, onClose }: ErrorBannerProps) {
  const isError = kind === 'error'
  const colors = isError
    ? 'border-red-500 text-red-700 dark:text-red-300'
    : 'border-green-600 text-green-800 dark:text-green-300'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${colors}`}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          aria-label="Закрыть сообщение"
          className="-m-2 min-h-11 min-w-11 shrink-0 text-lg leading-none"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
