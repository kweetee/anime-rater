import { StarIcon } from './Doodles'

interface RatingMarkProps {
  rating: number | null
  isReference: boolean
  className?: string // размер и цвет текста задаёт родитель
}

// Оценка; у эталона перед ней стоит звёздочка. Если оценки нет и это не эталон, ничего не показывает.
export function RatingMark({ rating, isReference, className = '' }: RatingMarkProps) {
  if (rating === null && !isReference) return null
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold leading-none ${className}`}
      title={isReference ? 'Эталон' : undefined}
    >
      {isReference && <StarIcon className="h-[1em] w-[1em]" />}
      {rating}
    </span>
  )
}

export default RatingMark
