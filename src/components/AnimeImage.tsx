import { useObjectUrl } from '../lib/useObjectUrl'

interface AnimeImageProps {
  blob: Blob | null
  alt: string
  className?: string // размеры задаёт родитель
  label?: string // буква на заглушке (по умолчанию первая буква названия)
}

// Первая буква или цифра названия (для заглушки)
function firstLetter(text: string): string {
  const match = text.match(/[\p{L}\p{N}]/u)
  return match ? match[0].toUpperCase() : '?'
}

// Показывает картинку аниме. Если картинки нет: тёмный фон и крупная первая буква названия.
export function AnimeImage({ blob, alt, className = '', label }: AnimeImageProps) {
  const url = useObjectUrl(blob)

  if (!url) {
    return (
      <div
        className={`hub-bg relative overflow-hidden ${className}`}
        // container-type нужен, чтобы размер буквы считался от размера заглушки (cqmin)
        style={{ containerType: 'size' }}
        role="img"
        aria-label="Нет картинки"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-semibold leading-none text-white/70"
          style={{ fontSize: '42cqmin' }}
        >
          {label ?? firstLetter(alt)}
        </span>
      </div>
    )
  }

  return <img src={url} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />
}

export default AnimeImage
