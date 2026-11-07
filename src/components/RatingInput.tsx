import { BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

const SCORES = Array.from({ length: 10 }, (_, i) => i + 1)

interface RatingInputProps {
  value: number | null
  onChange: (value: number | null) => void
}

// Ввод оценки: ряд кнопок 1–10 (только целые). null означает «без оценки».
export function RatingInput({ value, onChange }: RatingInputProps) {
  // Старая дробная оценка (например 7.5) не подсвечивается, пока не выбрать новую
  const isFractional = value !== null && !Number.isInteger(value)

  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Оценка"
        className="grid grid-cols-5 gap-1.5 sm:grid-cols-10"
      >
        {SCORES.map((score) => {
          const selected = value === score
          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`h-11 rounded-md border-2 font-mono text-lg font-bold transition ${
                selected
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              }`}
              onClick={() => onChange(score)}
            >
              {score}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>
          {value === null && 'Без оценки'}
          {isFractional && `Сейчас оценка ${value}. Выберите целую.`}
        </span>
        {value !== null && (
          <button
            type="button"
            className={BUTTON_SECONDARY_CLASSES}
            onClick={() => onChange(null)}
          >
            Убрать оценку
          </button>
        )}
      </div>
    </div>
  )
}

export default RatingInput
