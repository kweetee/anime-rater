import { db } from './db'
import { createTag } from './actions'
import type { Anime } from '../types'
import {
  HAS_IMAGE_PROXY,
  fetchAnimeDetails,
  fetchCompletedList,
  fetchCover,
  sleep,
} from '../lib/shikimori'
import type { ShikimoriAnime, ShikimoriDetails } from '../lib/shikimori'

// Импорт списка «просмотрено» с Шикимори в базу.
// Новые аниме добавляются с типом и жанрами (жанры становятся метками).
// У аниме, которые уже есть в списке, но без типа, дописываются тип и жанры.

export type ImportProgress =
  | { stage: 'list'; loaded: number } // грузим список
  | { stage: 'covers'; done: number; total: number } // грузим обложки
  | { stage: 'genres'; done: number; total: number } // грузим тип и жанры
  | { stage: 'saving' } // записываем в базу

export interface ShikimoriImportResult {
  found: number // всего аниме в списке на Шикимори
  added: number // добавлено
  skipped: number // пропущено: такое название уже есть
  updated: number // у уже имеющихся дописаны тип и жанры
  withoutRating: number // добавлено без оценки
  covers: number // сколько обложек загружено
  coverErrors: number // у скольких обложка не загрузилась
  coversStopped: boolean // загрузка обложек остановлена из-за повторяющихся ошибок
  detailErrors: number // у скольких аниме не загрузились жанры
  detailsStopped: boolean // загрузка жанров остановлена из-за повторяющихся ошибок
}

const COVER_PARALLEL = 3 // сколько обложек качаем одновременно
const COVER_MAX_FAILS_IN_ROW = 5 // после стольких ошибок подряд обложки отключаем
const DETAIL_DELAY_MS = 700 // пауза между запросами жанров: у Шикимори лимит 90 запросов в минуту
const DETAIL_MAX_FAILS_IN_ROW = 5 // после стольких ошибок подряд жанры отключаем

export async function importFromShikimori(
  nick: string,
  withCovers: boolean,
  withGenres: boolean,
  onProgress: (progress: ImportProgress) => void,
): Promise<ShikimoriImportResult> {
  onProgress({ stage: 'list', loaded: 0 })
  const list = await fetchCompletedList(nick, (loaded) => onProgress({ stage: 'list', loaded }))

  // Дубликаты по названию (без учёта регистра) пропускаем
  const localAnime = await db.anime.toArray()
  const localByTitle = new Map<string, Anime>()
  for (const anime of localAnime) localByTitle.set(anime.title.trim().toLowerCase(), anime)

  const fresh: ShikimoriAnime[] = [] // новые
  const toUpdate: { item: ShikimoriAnime; local: Anime }[] = [] // уже есть, но без типа
  const seenNew = new Set<string>()
  let skipped = 0
  for (const item of list) {
    const key = item.title.trim().toLowerCase()
    const local = localByTitle.get(key)
    if (local) {
      skipped += 1
      if ((local.kind ?? null) === null) toUpdate.push({ item, local })
      continue
    }
    if (seenNew.has(key)) {
      skipped += 1
      continue
    }
    seenNew.add(key)
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

  // Жанры: по одному запросу на аниме, не чаще лимита Шикимори
  const details = new Map<number, ShikimoriDetails>()
  let detailErrors = 0
  let detailsStopped = false
  if (withGenres) {
    const targets = [...fresh, ...toUpdate.map((entry) => entry.item)]
    if (targets.length > 0) {
      let failsInRow = 0
      onProgress({ stage: 'genres', done: 0, total: targets.length })
      for (const [index, item] of targets.entries()) {
        try {
          details.set(item.shikiId, await fetchAnimeDetails(item.shikiId))
          failsInRow = 0
        } catch {
          detailErrors += 1
          failsInRow += 1
          if (failsInRow >= DETAIL_MAX_FAILS_IN_ROW) {
            detailsStopped = true
            break
          }
        }
        onProgress({ stage: 'genres', done: index + 1, total: targets.length })
        if (index < targets.length - 1) await sleep(DETAIL_DELAY_MS)
      }
    }
  }

  onProgress({ stage: 'saving' })

  // Жанры превращаем в метки (одинаковые по названию не дублируются)
  const tagIdCache = new Map<string, number>()
  async function tagIdsFor(shikiId: number): Promise<number[]> {
    const ids: number[] = []
    for (const name of details.get(shikiId)?.genres ?? []) {
      const key = name.toLowerCase()
      let id = tagIdCache.get(key)
      if (id === undefined) {
        id = await createTag(name)
        tagIdCache.set(key, id)
      }
      if (!ids.includes(id)) ids.push(id)
    }
    return ids
  }

  const now = Date.now()
  // Новые записи без id: его выдаст сама база
  const rows: Omit<Anime, 'id'>[] = []
  for (const [index, item] of fresh.entries()) {
    rows.push({
      title: item.title,
      image: blobs[index],
      rating: item.rating,
      kind: item.kind ?? details.get(item.shikiId)?.kind ?? null,
      comment: '',
      tagIds: await tagIdsFor(item.shikiId),
      isReference: false,
      tierId: null,
      createdAt: now,
      updatedAt: now,
    })
  }
  if (rows.length > 0) await db.anime.bulkAdd(rows as Anime[])

  // Уже имеющиеся: дописываем тип и жанры (то, что стояло у них, не трогаем)
  let updated = 0
  for (const { item, local } of toUpdate) {
    const kind = item.kind ?? details.get(item.shikiId)?.kind ?? null
    const newTagIds = await tagIdsFor(item.shikiId)
    const tagIds = Array.from(new Set([...local.tagIds, ...newTagIds]))
    if (kind === null && tagIds.length === local.tagIds.length) continue
    await db.anime.update(local.id, { kind, tagIds })
    updated += 1
  }

  return {
    found: list.length,
    added: rows.length,
    skipped,
    updated,
    withoutRating: fresh.filter((item) => item.rating === null).length,
    covers,
    coverErrors,
    coversStopped,
    detailErrors,
    detailsStopped,
  }
}
