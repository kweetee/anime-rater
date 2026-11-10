// Тип аниме (так же называются виды на Шикимори)
export type AnimeKind =
  | 'tv'
  | 'movie'
  | 'ova'
  | 'ona'
  | 'special'
  | 'tv_special'
  | 'music'
  | 'pv'
  | 'cm'

// Аниме: основная сущность приложения
export interface Anime {
  id: number
  title: string
  image: Blob | null // сжатая картинка (макс. сторона 600px)
  rating: number | null // целая оценка 1–10
  kind: AnimeKind | null // тип (TV, OVA, Special...); null — не указан
  comment: string
  tagIds: number[]
  isReference: boolean // эталон: уверен в этой оценке
  tierId: number | null
  createdAt: number
  updatedAt: number
}

// Метка (жанр, настроение и т.п.)
export interface Tag {
  id: number
  name: string
  color?: string
}

// Строка тир-листа
export interface Tier {
  id: number
  name: string
  color: string
  order: number
}

// Подсказка к оценке: что заслуживает такой балл
export interface RatingHint {
  score: number // 1–10
  description: string
}

// Сохранённая раскладка тир-листа: набор тиров и кто в каком стоит
export interface Layout {
  id: number
  name: string
  createdAt: number
  tiers: { name: string; color: string }[] // по порядку сверху вниз
  assignments: [number, number][] // пары [id аниме, номер тира в списке tiers]
}
