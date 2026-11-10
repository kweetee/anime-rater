import { useEffect, useState } from 'react'

// Единый индикатор загрузки. Если грузится слишком долго — подсказка, что делать.
export function Spinner({ label = 'Загрузка…' }: { label?: string }) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 py-8 text-slate-500 dark:text-slate-400"
    >
      <div
        aria-hidden="true"
        className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400"
      />
      <p className="text-sm">{label}</p>
      {slow && (
        <p className="max-w-sm text-center text-xs">
          Загрузка затянулась. Попробуйте обновить страницу. Если вы в приватном режиме
          браузера, там база данных может не работать.
        </p>
      )}
    </div>
  )
}

export default Spinner
