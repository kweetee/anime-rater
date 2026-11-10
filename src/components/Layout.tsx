import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navItems } from '../lib/navItems'
import { ErrorBoundary } from './ErrorBoundary'

// Пункт меню на ПК: текст, активный подчёркнут
function desktopLinkClass({ isActive }: { isActive: boolean }) {
  const base = 'border-b-2 px-1 py-1.5 text-sm transition-colors'
  return isActive
    ? `${base} border-slate-900 font-semibold text-slate-900 dark:border-white dark:text-white`
    : `${base} border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white`
}

// Пункт меню на телефоне: активный с линией сверху
function mobileLinkClass({ isActive }: { isActive: boolean }) {
  const base = '-mt-px flex flex-1 items-center justify-center border-t-2 py-4 text-xs'
  return isActive
    ? `${base} border-slate-900 font-semibold text-slate-900 dark:border-white dark:text-white`
    : `${base} border-transparent text-slate-500 dark:text-slate-400`
}

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      {/* Шапка: видна только на широких экранах (md и выше). Логотип не ссылка, меню по центру */}
      <header className="hidden border-b border-slate-300 md:block dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 pb-3 pt-7 text-center">
          <div className="text-3xl font-bold tracking-tight">Anime Rater</div>
          <nav aria-label="Основная навигация" className="mt-5 flex justify-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={desktopLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Содержимое текущей страницы. Нижний отступ нужен, чтобы панель на телефоне ничего не закрывала */}
      <main className="mx-auto max-w-5xl p-4 pb-24 md:pb-10 md:pt-6">
        {/* key сбрасывает сообщение об ошибке при переходе на другую страницу */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Нижняя панель: видна только на телефоне, без иконок */}
      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-300 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-950"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={mobileLinkClass}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
