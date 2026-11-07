import type { Anime } from '../types'

// Варианты сортировки: поле и направление в одном значении
export type SortMode =
  | 'date-desc'
  | 'date-asc'
  | 'rating-desc'
  | 'rating-asc'
  | 'title-asc'
  | 'title-desc'

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'date-desc', label: 'Сначала новые' },
  { value: 'date-asc', label: 'Сначала старые' },
  { value: 'rating-desc', label: 'Оценка: по убыванию' },
  { value: 'rating-asc', label: 'Оценка: по возрастанию' },
  { value: 'title-asc', label: 'Название: А → Я' },
  { value: 'title-desc', label: 'Название: Я → А' },
]

export interface FilterOptions {
  query: string // поиск по названию и комментарию
  tagIds: number[] // выбранные метки (режим «И»: нужны все)
  sortMode: SortMode
  onlyReferences?: boolean // показывать только эталоны
  rating?: number | null // показывать только аниме с ровно такой оценкой
}

function compareTitle(a: Anime, b: Anime): number {
  return a.title.localeCompare(b.title, 'ru')
}

// Сравнение по оценке: аниме без оценки всегда в конце списка
function compareRating(a: Anime, b: Anime, direction: 1 | -1): number {
  if (a.rating === null && b.rating === null) return compareTitle(a, b)
  if (a.rating === null) return 1
  if (b.rating === null) return -1
  const diff = (a.rating - b.rating) * direction
  return diff !== 0 ? diff : compareTitle(a, b)
}

// Применяет поиск, фильтры и сортировку. Исходный массив не меняет.
export function filterAnime(list: Anime[], options: FilterOptions): Anime[] {
  const query = options.query.trim().toLowerCase()

  const result = list.filter((anime) => {
    if (options.onlyReferences && !anime.isReference) return false
    if (
      options.rating !== undefined &&
      options.rating !== null &&
      anime.rating !== options.rating
    ) {
      return false
    }
    if (query) {
      const inTitle = anime.title.toLowerCase().includes(query)
      const inComment = anime.comment.toLowerCase().includes(query)
      if (!inTitle && !inComment) return false
    }
    return options.tagIds.every((id) => anime.tagIds.includes(id))
  })

  result.sort((a, b) => {
    switch (options.sortMode) {
      case 'date-desc':
        return b.createdAt - a.createdAt
      case 'date-asc':
        return a.createdAt - b.createdAt
      case 'rating-desc':
        return compareRating(a, b, -1)
      case 'rating-asc':
        return compareRating(a, b, 1)
      case 'title-asc':
        return compareTitle(a, b)
      case 'title-desc':
        return compareTitle(b, a)
    }
  })

  return result
}
