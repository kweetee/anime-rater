import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { AnimeImage } from './AnimeImage'
import { compressImage } from '../lib/compressImage'
import { BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

interface ImageFieldProps {
  value: Blob | null
  onChange: (blob: Blob | null) => void
}

// Загрузка картинки: выбор файла, сжатие до 600px и предпросмотр
export function ImageField({ value, onChange }: ImageFieldProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Сбрасываем input, чтобы можно было выбрать тот же файл ещё раз
    event.target.value = ''
    if (!file) return

    setBusy(true)
    setError('')
    try {
      onChange(await compressImage(file))
    } catch {
      setError('Не удалось обработать файл. Попробуйте другую картинку (JPG, PNG, WebP).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-start gap-4">
      <AnimeImage
        blob={value}
        alt="Предпросмотр картинки"
        className="h-36 w-24 shrink-0 rounded-lg"
      />

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {/* Скрытый input внутри label: клик по кнопке открывает выбор файла */}
          <label
            className={`${BUTTON_SECONDARY_CLASSES} cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}
          >
            {busy ? 'Сжимаю…' : value ? 'Заменить' : 'Выбрать картинку'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={handleFile}
            />
          </label>

          {value && (
            <button
              type="button"
              className={BUTTON_SECONDARY_CLASSES}
              disabled={busy}
              onClick={() => onChange(null)}
            >
              Убрать
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Картинка сжимается автоматически, оригинал не сохраняется.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default ImageField
