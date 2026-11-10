import type { ReactNode } from 'react'

interface PageTitleProps {
  children: ReactNode
  actions?: ReactNode // кнопки справа от заголовка
}

// Заголовок страницы с тонкой линией под ним (как заголовки разделов в «хабе»)
export function PageTitle({ children, actions }: PageTitleProps) {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-slate-300 pb-2 dark:border-slate-700">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </h1>
      {actions}
    </div>
  )
}

export default PageTitle
