// Аниме: основная сущность приложения
export interface Anime {
  id: number
  title: string
  image: Blob | null // сжатая картинка (макс. сторона 600px)
  rating: number | null // шкала 1–10, шаг 0.5
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
