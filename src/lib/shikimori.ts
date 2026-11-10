import { compressImage } from './compressImage'
import { parseKind } from './animeKinds'
import type { AnimeKind } from '../types'

// Работа с Шикимори: загрузка списка просмотренного и обложек.

// Адрес сайта Шикимори. Домен уже менялся (.one -> .io): если снова сменится, поправьте здесь.
export const SHIKIMORI_SITE = 'https://shikimori.io'

// Адрес вашего посредника для обложек (Cloudflare Worker), например:
// 'https://anime-rater-covers.ваш-поддомен.workers.dev'
// Пока строка пустая, обложки отключены (название и оценки импортируются без них).
export const IMAGE_PROXY_URL: string = 'https://anime-rater-covers.ekwite67.workers.dev/'

export const HAS_IMAGE_PROXY = IMAGE_PROXY_URL.trim() !== ''

// Одно аниме из списка пользователя на Шикимори
export interface ShikimoriAnime {
  shikiId: number
  title: string // русское название, а если его нет — английское
  rating: number | null // целое 1–10 или null (на Шикимори 0 = без оценки)
  imagePath: string | null // путь вида /system/animes/original/123.jpg
  kind: AnimeKind | null // тип: tv, ova, special... (null, если Шикимори не прислал)
}

// Ошибка с понятным текстом для пользователя
export class ShikimoriError extends Error {}

const PAGE_LIMIT = 500
const MAX_PAGES = 20

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Превращает одну запись ответа Шикимори в наш формат. Битые записи отбрасывает.
function parseRate(raw: unknown): ShikimoriAnime | null {
  if (!isRecord(raw) || !isRecord(raw.anime)) return null
  const anime = raw.anime
  if (typeof anime.id !== 'number') return null

  const russian = typeof anime.russian === 'string' ? anime.russian.trim() : ''
  const name = typeof anime.name === 'string' ? anime.name.trim() : ''
  const title = russian || name
  if (title === '') return null

  const score = typeof raw.score === 'number' ? raw.score : 0
  const rating = Number.isInteger(score) && score >= 1 && score <= 10 ? score : null

  // Берём только настоящие обложки (у аниме без обложки путь ведёт на заглушку)
  let imagePath: string | null = null
  if (isRecord(anime.image)) {
    const original = typeof anime.image.original === 'string' ? anime.image.original : ''
    const preview = typeof anime.image.preview === 'string' ? anime.image.preview : ''
    const path = original || preview
    if (path.startsWith('/system/animes/')) imagePath = path
  }

  return { shikiId: anime.id, title, rating, imagePath, kind: parseKind(anime.kind) }
}

// Загружает весь список «просмотрено» по нику. Список публичный, вход не нужен.
export async function fetchCompletedList(
  nick: string,
  onLoaded?: (count: number) => void,
): Promise<ShikimoriAnime[]> {
  const items: ShikimoriAnime[] = []
  const seen = new Set<number>()

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url =
      `${SHIKIMORI_SITE}/api/users/${encodeURIComponent(nick)}/anime_rates` +
      `?is_nickname=1&status=completed&limit=${PAGE_LIMIT}&page=${page}`

    let response: Response
    try {
      response = await fetch(url)
    } catch {
      throw new ShikimoriError('Не удалось связаться с Шикимори. Проверьте интернет или VPN.')
    }
    if (response.status === 404) {
      throw new ShikimoriError('Пользователь не найден. Проверьте ник.')
    }
    if (response.status === 429) {
      throw new ShikimoriError('Шикимори просит делать запросы реже. Подождите минуту и повторите.')
    }
    if (!response.ok) {
      throw new ShikimoriError(`Шикимори ответил ошибкой ${response.status}. Попробуйте позже.`)
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new ShikimoriError('Шикимори вернул непонятный ответ. Попробуйте позже.')
    }
    if (!Array.isArray(data)) {
      throw new ShikimoriError('Шикимори вернул непонятный ответ. Попробуйте позже.')
    }

    // Шикимори отдаёт на 1 запись больше лимита (чтобы понять, есть ли следующая страница),
    // поэтому одно и то же аниме может прийти дважды. Дубли убираем по id.
    for (const raw of data) {
      const item = parseRate(raw)
      if (item && !seen.has(item.shikiId)) {
        seen.add(item.shikiId)
        items.push(item)
      }
    }
    onLoaded?.(items.length)

    // Записей не больше лимита: это последняя страница
    if (data.length <= PAGE_LIMIT) break
    await sleep(500) // у Шикимори лимит 5 запросов в секунду
  }
  return items
}

// Скачивает обложку через посредника и сжимает так же, как картинки из формы (JPEG, до 600px).
export async function fetchCover(imagePath: string): Promise<Blob> {
  const target = `${SHIKIMORI_SITE}${imagePath}`
  const response = await fetch(`${IMAGE_PROXY_URL}?url=${encodeURIComponent(target)}`)
  if (!response.ok) throw new Error(`Посредник ответил ${response.status}`)
  const blob = await response.blob()
  if (!blob.type.startsWith('image/')) throw new Error('Ответ не похож на картинку')
  return compressImage(new File([blob], 'cover', { type: blob.type }))
}

// Подробности об одном аниме: тип и жанры. Для жанров нужен отдельный запрос на каждое аниме.
export interface ShikimoriDetails {
  kind: AnimeKind | null
  genres: string[] // названия жанров (русские, а если их нет — английские)
}

export async function fetchAnimeDetails(shikiId: number): Promise<ShikimoriDetails> {
  const url = `${SHIKIMORI_SITE}/api/animes/${shikiId}`
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response: Response
    try {
      response = await fetch(url)
    } catch {
      throw new ShikimoriError('Не удалось связаться с Шикимори. Проверьте интернет или VPN.')
    }
    // Слишком частые запросы: один раз ждём и повторяем
    if (response.status === 429 && attempt === 0) {
      await sleep(5000)
      continue
    }
    if (!response.ok) {
      throw new ShikimoriError(`Шикимори ответил ошибкой ${response.status}.`)
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new ShikimoriError('Шикимори вернул непонятный ответ.')
    }
    if (!isRecord(data)) throw new ShikimoriError('Шикимори вернул непонятный ответ.')

    const genres: string[] = []
    if (Array.isArray(data.genres)) {
      for (const genre of data.genres) {
        if (!isRecord(genre)) continue
        const russian = typeof genre.russian === 'string' ? genre.russian.trim() : ''
        const name = typeof genre.name === 'string' ? genre.name.trim() : ''
        const label = russian || name
        if (label && !genres.includes(label)) genres.push(label)
      }
    }
    return { kind: parseKind(data.kind), genres }
  }
  throw new ShikimoriError('Шикимори просит делать запросы реже. Подождите минуту и повторите.')
}
