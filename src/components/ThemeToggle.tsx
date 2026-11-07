import { useTheme, type ThemeMode } from '../lib/useTheme'

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'dark', label: 'Тёмная' },
  { mode: 'light', label: 'Светлая' },
  { mode: 'system', label: 'Как в системе' },
]

// Переключатель темы из трёх кнопок
export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  return (
    <div role="group" aria-label="Тема оформления" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={mode === option.mode}
          className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium ${
            mode === option.mode
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
          }`}
          onClick={() => setMode(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle
