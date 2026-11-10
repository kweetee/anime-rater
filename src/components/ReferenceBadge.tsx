import { REFERENCE_BADGE_CLASSES } from '../lib/styles'
import { StarIcon } from './Doodles'

// Плашка «Эталон». Одна и та же на всех экранах (стиль — в lib/styles.ts).
export function ReferenceBadge() {
  return (
    <span className={REFERENCE_BADGE_CLASSES}>
      <StarIcon className="h-2.5 w-2.5" />
      Эталон
    </span>
  )
}

export default ReferenceBadge
