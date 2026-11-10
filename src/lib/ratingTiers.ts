// Тир-лист «по оценкам»: строки 10, 9, ... 1 и «Без оценки».
// Цвета: от белого (10) к чёрному (1).
export const RATING_SCORES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export const RATING_TIER_COLORS: Record<number, string> = {
  10: '#f4f4f4',
  9: '#e2e2e2',
  8: '#cfcfcf',
  7: '#b8b8b8',
  6: '#9e9e9e',
  5: '#858585',
  4: '#6b6b6b',
  3: '#525252',
  2: '#3a3a3a',
  1: '#242424',
}

// В какую строку попадает оценка. Без оценки — null. Старые дробные оценки (7.5) округляются вниз.
export function ratingBucket(rating: number | null): number | null {
  if (rating === null) return null
  return Math.min(10, Math.max(1, Math.floor(rating)))
}
