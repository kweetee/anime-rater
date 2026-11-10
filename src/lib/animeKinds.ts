import type { AnimeKind } from '../types'

// Типы аниме в том порядке, в котором они показываются в фильтрах
export const KIND_ORDER: AnimeKind[] = [
  'tv',
  'movie',
  'ova',
  'ona',
  'special',
  'tv_special',
  'music',
  'pv',
  'cm',
]

export const KIND_LABELS: Record<AnimeKind, string> = {
  tv: 'TV',
  movie: 'Фильм',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Special',
  tv_special: 'TV Special',
  music: 'Клип',
  pv: 'PV',
  cm: 'CM',
}

// Превращает любое значение (из Шикимори или из файла) в тип или null
export function parseKind(value: unknown): AnimeKind | null {
  if (typeof value !== 'string') return null
  const key = value.trim().toLowerCase()
  return (KIND_ORDER as string[]).includes(key) ? (key as AnimeKind) : null
}
