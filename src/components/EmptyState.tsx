import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  children?: ReactNode // кнопка или ссылка под текстом
}

// Единое «пустое состояние»: рамка с пояснением и, при необходимости, действием
export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
      <p className="mb-3 text-slate-600 dark:text-slate-300">{message}</p>
      {children}
    </div>
  )
}

export default EmptyState
