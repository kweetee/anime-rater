import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  children?: ReactNode // кнопка или ссылка под текстом
}

// Единое «пустое состояние»: пунктирная рамка с пояснением и, при необходимости, действием
export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-slate-400 p-6 text-center dark:border-slate-600">
      <p className="mb-3 text-slate-600 dark:text-slate-300">{message}</p>
      {children}
    </div>
  )
}

export default EmptyState
