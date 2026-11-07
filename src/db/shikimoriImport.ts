import { db } from './db'
import type { Anime } from '../types'
import { HAS_IMAGE_PROXY, fetchCompletedList, fetchCover } from '../lib/shikimori'
import type { ShikimoriAnime } from '../lib/shikimori'

// Импорт списка «просмотрено» с Шикимори в базу. Схему Dexie не меняем.

export type ImportProgress =
  | { stage: 'list'; loaded: number } // грузим список
  | { stage: 'covers'; done: number; total: number } // грузим обложки
  | { stage: 'saving' } // записываем в базу

export interface ShikimoriImportResult {
  found: number // всего аниме в списке на Шикимори
  added: number // добавлено
  skipped: number // пропущено: такое название уже есть
  withoutRating: number // добавлено без оценки
  covers: number // сколько обложек загружено
  coverErrors: number // у скольких обложка не загрузилась
  coversStopped: boolean // загрузка обложек остановлена из-за повторяющихся ошибок
}

const COVER_PARALLEL = 3 // сколько обложек качаем одновременно
const COVER_MAX_FAILS_IN_ROW = 5 // после стольких ошибок подряд обложки отключаем

export async function importFromShikimori(
  nick: string,
  withCovers: boolean,
  onProgress: (progress: ImportProgress) => void,
): Promise<ShikimoriImportResult> {
  onProgress({ stage: 'list', loaded: 0 })
  const list = await fetchCompletedList(nick, (loaded) => onProgress({ stage: 'list', loaded }))

  // Дубликаты по названию (без учёта регистра) пропускаем, как при обычном импорте
  const titleKeys = await db.anime.orderBy('title').keys()
  const knownTitles = new Set(titleKeys.map((key) => String(key).trim().toLowerCase()))
  const fresh: ShikimoriAnime[] = []
  let skipped = 0
  for (const item of list) {
    const key = item.title.toLowerCase()
    if (knownTitles.has(key)) {
      skipped += 1
      continue
    }
    knownTitles.add(key)
    fresh.push(item)
  }

  // Обложки: качаем до записи в базу (внутри транзакции Dexie ждать сеть нельзя)
  const blobs: (Blob | null)[] = fresh.map(() => null)
  let covers = 0
  let coverErrors = 0
  let coversStopped = false

  if (withCovers && HAS_IMAGE_PROXY && fresh.length > 0) {
    let next = 0
    let done = 0
    let failsInRow = 0
    onProgress({ stage: 'covers', done: 0, total: fresh.length })

    const runWorker = async () => {
      while (!coversStopped) {
        const index = next
        next += 1
        if (index >= fresh.length) return
        const imagePath = fresh[index].imagePath
        if (imagePath) {
          try {
            blobs[index] = await fetchCover(imagePath)
            covers += 1
            failsInRow = 0
          } catch {
            coverErrors += 1
            failsInRow += 1
            if (failsInRow >= COVER_MAX_FAILS_IN_ROW) coversStopped = true
          }
        }
        done += 1
        onProgress({ stage: 'covers', done, total: fresh.length })
      }
    }
    await Promise.all(Array.from({ length: COVER_PARALLEL }, runWorker))
  }

  onProgress({ stage: 'saving' })
  const now = Date.now()
  // Новые записи без id: его выдаст сама база
  const rows: Omit<Anime, 'id'>[] = fresh.map((item, index) => ({
    title: item.title,
    image: blobs[index],
    rating: item.rating,
    comment: '',
    tagIds: [],
    isReference: false,
    tierId: null,
    createdAt: now,
    updatedAt: now,
  }))
  if (rows.length > 0) await db.anime.bulkAdd(rows as Anime[])

  return {
    found: list.length,
    added: rows.length,
    skipped,
    withoutRating: fresh.filter((item) => item.rating === null).length,
    covers,
    coverErrors,
    coversStopped,
  }
}
