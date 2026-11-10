import Dexie, { type EntityTable } from 'dexie'
import type { Anime, Tag, Tier, RatingHint, Layout } from '../types'

// Тип базы: четыре таблицы с понятными типами
export const db = new Dexie('anime-rater') as Dexie & {
  anime: EntityTable<Anime, 'id'>
  tags: EntityTable<Tag, 'id'>
  tiers: EntityTable<Tier, 'id'>
  ratingHints: EntityTable<RatingHint, 'score'>
  layouts: EntityTable<Layout, 'id'>
}

// Описания оценок по умолчанию. Аниме оценивается ЦЕЛИКОМ, по общему ощущению (вайбу),
// без разбивки на сюжет, музыку и т.п. Можно переписать на странице «Калибровка».
export const DEFAULT_HINTS: Record<number, string> = {
  1: 'Неприятно от начала до конца. Хотелось выключить, остался осадок и ощущение потерянного времени.',
  2: 'Почти не зацепило, местами бесило. Досмотрел из упрямства, послевкусие плохое.',
  3: 'Смотреть было тяжело. Вайб не сложился, я скучал или морщился. Редкие светлые моменты картину не меняют.',
  4: 'Не моё. Что-то ощущается, но слабо или криво: смотрел вполглаза и быстро забыл.',
  5: 'Ровно, без эмоций. Не жалею, что посмотрел, но ничего не осталось: через неделю не вспомню.',
  6: 'Приятно провёл время. Вайб есть, но он не держит до конца или проседает. Хорошо «на фон» вечера.',
  7: 'Хорошо зашло. В целом поймал настроение и состояние, могу посоветовать тем, кому близок такой вайб.',
  8: 'Очень сильное ощущение. Цепляет, держит и запоминается, хочется вернуться к любимым моментам.',
  9: 'Почти идеально. Состояние держится днями, хочется пересматривать и показывать другим.',
  10: 'Попадание в самое сердце. Вайб, в котором хочется жить: остаётся навсегда и служит мерилом для всего остального.',
}

// Схема: перечислены только поля, по которым будем искать и сортировать.
// "++id" — автоинкремент, "*tagIds" — индекс по каждому элементу массива меток.
const SCHEMA = {
  anime: '++id, title, rating, tierId, isReference, createdAt, updatedAt, *tagIds',
  tags: '++id, name',
  tiers: '++id, order',
  ratingHints: 'score',
}

db.version(1).stores(SCHEMA)

// Версия 2: схема та же. Один раз заполняет ПУСТЫЕ описания оценок текстами по умолчанию.
// Описания, которые вы уже написали сами, не трогаются.
db.version(2)
  .stores(SCHEMA)
  .upgrade((tx) =>
    tx
      .table('ratingHints')
      .toCollection()
      .modify((hint: RatingHint) => {
        if (!hint.description.trim()) {
          hint.description = DEFAULT_HINTS[hint.score] ?? ''
        }
      }),
  )

// Версия 3: у аниме появилось поле kind (тип: TV, OVA, Special...). У старых записей оно null.
// Список индексов не менялся: по типу фильтруем в коде.
db.version(3)
  .stores(SCHEMA)
  .upgrade((tx) =>
    tx
      .table('anime')
      .toCollection()
      .modify((anime: Anime) => {
        if (anime.kind === undefined) anime.kind = null
      }),
  )

// Версия 4: новая таблица layouts (сохранённые раскладки тир-листа).
// Заодно стандартные тиры (S, A, B, C, D) со старыми разноцветными цветами перекрашиваются в серые.
// Если вы меняли цвет сами, он не трогается.
const OLD_TIER_COLORS: Record<string, string> = {
  S: '#ef4444',
  A: '#f97316',
  B: '#eab308',
  C: '#22c55e',
  D: '#3b82f6',
}
const GRAY_TIER_COLORS: Record<string, string> = {
  S: '#f4f4f4',
  A: '#cfcfcf',
  B: '#9a9a9a',
  C: '#5e5e5e',
  D: '#2b2b2b',
}
db.version(4)
  .stores({ ...SCHEMA, layouts: '++id, createdAt' })
  .upgrade((tx) =>
    tx
      .table('tiers')
      .toCollection()
      .modify((tier: Tier) => {
        if (OLD_TIER_COLORS[tier.name] === tier.color.toLowerCase()) {
          tier.color = GRAY_TIER_COLORS[tier.name]
        }
      }),
  )

// Срабатывает один раз при первом создании базы:
// стандартные тиры (оттенки серого) и описания для оценок 1–10
db.on('populate', (tx) => {
  tx.table('tiers').bulkAdd([
    { name: 'S', color: '#f4f4f4', order: 0 },
    { name: 'A', color: '#cfcfcf', order: 1 },
    { name: 'B', color: '#9a9a9a', order: 2 },
    { name: 'C', color: '#5e5e5e', order: 3 },
    { name: 'D', color: '#2b2b2b', order: 4 },
  ])
  tx.table('ratingHints').bulkAdd(
    Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      description: DEFAULT_HINTS[i + 1],
    })),
  )
})
