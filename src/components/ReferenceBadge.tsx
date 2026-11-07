import { REFERENCE_BADGE_CLASSES } from '../lib/styles'

// Значок «Эталон». Один и тот же на всех экранах (стиль — в lib/styles.ts).
export function ReferenceBadge() {
  return <span className={REFERENCE_BADGE_CLASSES}>★ Эталон</span>
}

export default ReferenceBadge
