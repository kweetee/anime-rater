import { useObjectUrl } from '../lib/useObjectUrl'

interface AnimeImageProps {
  blob: Blob | null
  alt: string
  className?: string // размеры и скругление задаёт родитель
}

// Показывает картинку аниме или заглушку, если картинки нет
export function AnimeImage({ blob, alt, className = '' }: AnimeImageProps) {
  const url = useObjectUrl(blob)

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-200 text-2xl dark:bg-slate-800 ${className}`}
        role="img"
        aria-label="Нет картинки"
      >
        🖼️
      </div>
    )
  }

  return <img src={url} alt={alt} className={`object-cover ${className}`} />
}

export default AnimeImage
