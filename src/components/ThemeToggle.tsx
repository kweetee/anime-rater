import { useTheme, type ThemeMode } from '../lib/useTheme'
import { CHIP_BASE, CHIP_SELECTED, CHIP_UNSELECTED } from '../lib/formStyles'

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
          className={`${CHIP_BASE} min-h-10 px-4 ${
            mode === option.mode ? CHIP_SELECTED : CHIP_UNSELECTED
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
