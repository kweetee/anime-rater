import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { deleteAnime, saveAnime } from '../db/actions'
import type { Anime } from '../types'
import { ImageField } from '../components/ImageField'
import { RatingInput } from '../components/RatingInput'
import { TagPicker } from '../components/TagPicker'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ReferenceBadge } from '../components/ReferenceBadge'
import { cardStateClasses } from '../lib/styles'
import {
  BUTTON_DANGER_CLASSES,
  BUTTON_PRIMARY_CLASSES,
  BUTTON_SECONDARY_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
} from '../lib/formStyles'

const MAX_TITLE_LENGTH = 200

// Сама форма. Получает начальные данные (null — новое аниме)
// и хранит значения полей в своём состоянии.
function AnimeForm({ initial }: { initial: Anime | null }) {
  const navigate = useNavigate()

  const [title, setTitle] = useState(initial?.title ?? '')
  const [image, setImage] = useState<Blob | null>(initial?.image ?? null)
  const [rating, setRating] = useState<number | null>(initial?.rating ?? null)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [tagIds, setTagIds] = useState<number[]>(initial?.tagIds ?? [])
  const [isReference, setIsReference] = useState(initial?.isReference ?? false)

  const [titleError, setTitleError] = useState('')
  const [referenceError, setReferenceError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const tags = useLiveQuery(() => db.tags.toArray())
  const sortedTags = useMemo(
    () => [...(tags ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [tags],
  )

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // Проверки перед сохранением
    const trimmedTitle = title.trim()
    let valid = true
    if (!trimmedTitle) {
      setTitleError('Введите название')
      valid = false
    } else {
      setTitleError('')
    }
    if (isReference && rating === null) {
      setReferenceError('Чтобы отметить эталоном, поставьте оценку')
      valid = false
    } else {
      setReferenceError('')
    }
    if (!valid) return

    // Выкидываем метки, которых уже нет в базе (например, удалили в этой же форме)
    const validTagIds = tags
      ? tagIds.filter((id) => tags.some((tag) => tag.id === id))
      : tagIds

    setSaving(true)
    setSaveError('')
    try {
      await saveAnime(initial?.id ?? null, {
        title: trimmedTitle,
        image,
        rating,
        comment: comment.trim(),
        tagIds: validTagIds,
        isReference,
        tierId: initial?.tierId ?? null, // тир не трогаем
      })
      navigate('/')
    } catch {
      setSaveError('Не удалось сохранить. Попробуйте ещё раз.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initial) return
    try {
      await deleteAnime(initial.id)
      navigate('/')
    } catch {
      setConfirmOpen(false)
      setSaveError('Не удалось удалить. Попробуйте ещё раз.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5" noValidate>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {initial ? 'Редактирование' : 'Новое аниме'}
      </h1>

      <div>
        <label htmlFor="anime-title" className={LABEL_CLASSES}>
          Название *
        </label>
        <input
          id="anime-title"
          type="text"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          autoFocus={!initial}
          aria-invalid={titleError !== ''}
          className={INPUT_CLASSES}
          onChange={(event) => {
            setTitle(event.target.value)
            if (titleError) setTitleError('')
          }}
        />
        {titleError && (
          <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <span className={LABEL_CLASSES}>Картинка</span>
        <ImageField value={image} onChange={setImage} />
      </div>

      <div>
        <span className={LABEL_CLASSES}>Оценка</span>
        <RatingInput value={rating} onChange={setRating} />
      </div>

      {/* Переключатель эталона: рамка подсвечивается общим стилем эталона */}
      <div>
        <button
          type="button"
          role="switch"
          aria-checked={isReference}
          onClick={() => {
            setIsReference((value) => !value)
            setReferenceError('')
          }}
          className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 p-3 text-left text-slate-900 dark:text-slate-100 ${cardStateClasses(isReference)}`}
        >
          <span className="space-y-1">
            <span className="block font-medium">Эталон</span>
            <span className="block text-sm text-slate-600 dark:text-slate-400">
              Я уверен в этой оценке и могу сравнивать с ней другие аниме.
            </span>
          </span>
          {isReference ? (
            <ReferenceBadge />
          ) : (
            <span className="shrink-0 text-sm text-slate-500">Выкл.</span>
          )}
        </button>
        {referenceError && (
          <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {referenceError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="anime-comment" className={LABEL_CLASSES}>
          Комментарий
        </label>
        <textarea
          id="anime-comment"
          value={comment}
          rows={4}
          className={INPUT_CLASSES}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>

      <div>
        <span className={LABEL_CLASSES}>Метки</span>
        <TagPicker tags={sortedTags} selectedIds={tagIds} onChange={setTagIds} />
      </div>

      {saveError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button type="submit" disabled={saving} className={BUTTON_PRIMARY_CLASSES}>
          {saving ? 'Сохраняю…' : initial ? 'Сохранить' : 'Добавить'}
        </button>
        <Link to="/" className={BUTTON_SECONDARY_CLASSES}>
          Отмена
        </Link>
        {initial && (
          <button
            type="button"
            disabled={saving}
            className={`${BUTTON_DANGER_CLASSES} ml-auto`}
            onClick={() => setConfirmOpen(true)}
          >
            Удалить
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить аниме?"
        message={`«${initial?.title ?? ''}» будет удалено без возможности восстановления.`}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmOpen(false)}
      />
    </form>
  )
}

// Редактирование: сначала загружаем аниме из базы, потом показываем форму.
// Загружаем один раз (не useLiveQuery), чтобы введённые данные не перезаписывались.
function EditLoader({ id }: { id: number }) {
  const [anime, setAnime] = useState<Anime | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    db.anime.get(id).then((found) => {
      if (!cancelled) setAnime(found ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (anime === undefined) {
    return <p className="text-slate-500 dark:text-slate-400">Загрузка…</p>
  }

  if (anime === null) {
    return <NotFound />
  }

  return <AnimeForm initial={anime} />
}

function NotFound() {
  return (
    <div className="space-y-3">
      <p className="text-slate-700 dark:text-slate-300">Такого аниме нет в базе.</p>
      <Link to="/" className={BUTTON_SECONDARY_CLASSES}>
        На главную
      </Link>
    </div>
  )
}

// Страница: /anime/new — новое, /anime/:id — редактирование
export function AnimeFormPage() {
  const { id } = useParams()

  if (id === undefined) {
    return <AnimeForm key="new" initial={null} />
  }

  const numericId = Number(id)
  if (!Number.isInteger(numericId)) {
    return <NotFound />
  }

  // key заставляет форму пересоздаться, если перейти на другое аниме
  return <EditLoader key={numericId} id={numericId} />
}

export default AnimeFormPage
