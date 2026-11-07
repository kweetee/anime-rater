import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navItems } from '../lib/navItems'
import { ErrorBoundary } from './ErrorBoundary'

// Стиль ссылки в верхней панели (ПК): активная подчёркнута оранжевой линией
function desktopLinkClass({ isActive }: { isActive: boolean }) {
  const base =
    'border-b-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors'
  return isActive
    ? `${base} border-indigo-500 text-slate-900 dark:text-white`
    : `${base} border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white`
}

// Стиль ссылки в нижней панели (телефон): только текст, активная с оранжевой полоской сверху
function mobileLinkClass({ isActive }: { isActive: boolean }) {
  const base =
    "relative flex flex-1 items-center justify-center px-1 py-4 text-[11px] font-semibold uppercase tracking-wide before:absolute before:inset-x-3 before:top-0 before:h-0.5"
  return isActive
    ? `${base} text-indigo-500 before:bg-indigo-500`
    : `${base} text-slate-500 before:bg-transparent dark:text-slate-400`
}

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen">
      {/* Верхняя панель: видна только на широких экранах (md и выше) */}
      <header className="sticky top-0 z-10 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl items-center gap-8 px-4 pt-3">
          <span className="font-serif text-lg font-bold tracking-wide">
            Anime Rater
          </span>
          <nav aria-label="Основная навигация" className="flex gap-1">
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
      <main className="mx-auto max-w-5xl p-4 pb-24 md:pb-8">
        {/* key сбрасывает сообщение об ошибке при переходе на другую страницу */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Нижняя панель: видна только на телефоне, без иконок */}
      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-900">
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
