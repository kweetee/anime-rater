import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Anime } from '../types'
import { DEFAULT_HINTS } from '../db/db'
import { saveRatingHint } from '../db/actions'
import { ReferenceMiniCard } from './ReferenceMiniCard'
import { BUTTON_SECONDARY_CLASSES, INPUT_CLASSES } from '../lib/formStyles'

interface RatingBlockProps {
  score: number // 1–10
  savedDescription: string // описание из базы (используется как начальное)
  references: Anime[] // эталоны с этой оценкой
  totalCount: number // сколько всего аниме с этой оценкой
}

const SAVE_DELAY_MS = 600

// Блок одного балла: описание (автосохранение), эталоны, кнопка «Показать все»
export function RatingBlock({
  score,
  savedDescription,
  references,
  totalCount,
}: RatingBlockProps) {
  const [text, setText] = useState(savedDescription)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Несохранённый текст и таймер храним в ref, чтобы не терять правку
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Сохраняет отложенный текст прямо сейчас
  async function flush() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const value = pendingRef.current
    if (value === null) return
    pendingRef.current = null
    await saveRatingHint(score, value)
    setStatus('saved')
  }

  function handleChange(value: string) {
    setText(value)
    setStatus('saving')
    pendingRef.current = value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, SAVE_DELAY_MS)
  }

  function resetToDefault() {
    const value = DEFAULT_HINTS[score] ?? ''
    setText(value)
    pendingRef.current = value
    void flush()
  }

  // При уходе со страницы дописываем то, что не успело сохраниться
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pendingRef.current !== null) {
        void saveRatingHint(score, pendingRef.current)
      }
    }
  }, [score])

  const defaultText = DEFAULT_HINTS[score] ?? ''

  return (
    <section className="frame space-y-3 bg-white p-4 [--fw:3px] dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-3xl font-bold leading-none text-indigo-700 dark:text-indigo-300">
          {score}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {status === 'saving' && 'Сохраняю…'}
          {status === 'saved' && 'Сохранено'}
        </span>
      </div>

      <div className="space-y-1">
        <textarea
          rows={3}
          value={text}
          aria-label={`Что заслуживает оценку ${score}`}
          placeholder="Что заслуживает такой балл?"
          className={INPUT_CLASSES}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => void flush()}
        />
        {text !== defaultText && (
          <button
            type="button"
            className="text-xs text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={resetToDefault}
          >
            Вернуть описание по умолчанию
          </button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Мои эталоны ({references.length})
        </h3>
        {references.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Эталонов пока нет.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {references.map((anime) => (
              <ReferenceMiniCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>

      <Link
        to={`/?rating=${score}`}
        className={`${BUTTON_SECONDARY_CLASSES} inline-block text-center`}
      >
        Показать все аниме с оценкой {score} ({totalCount})
      </Link>
    </section>
  )
}

export default RatingBlock
