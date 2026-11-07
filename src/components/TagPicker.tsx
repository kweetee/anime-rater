import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Tag } from '../types'
import { createTag, deleteTag } from '../db/actions'
import { TagChip } from './TagChip'
import { ConfirmDialog } from './ConfirmDialog'
import { BUTTON_SECONDARY_CLASSES, INPUT_CLASSES } from '../lib/formStyles'

interface TagPickerProps {
  tags: Tag[] // все существующие метки
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

// Выбор меток, создание новой и удаление метки (у всех аниме сразу)
export function TagPicker({ tags, selectedIds, onChange }: TagPickerProps) {
  const [newName, setNewName] = useState('')
  const [manageMode, setManageMode] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [error, setError] = useState('')

  function toggle(id: number) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((tagId) => tagId !== id)
        : [...selectedIds, id],
    )
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    try {
      const id = await createTag(name)
      // Новая метка сразу выбирается
      if (!selectedIds.includes(id)) onChange([...selectedIds, id])
      setNewName('')
      setError('')
    } catch {
      setError('Не удалось создать метку')
    }
  }

  // Enter в поле создаёт метку, а не отправляет всю форму
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void handleCreate()
    }
  }

  async function handleConfirmDelete() {
    if (!tagToDelete) return
    const id = tagToDelete.id
    try {
      await deleteTag(id)
      onChange(selectedIds.filter((tagId) => tagId !== id))
      setError('')
    } catch {
      setError('Не удалось удалить метку')
    }
    setTagToDelete(null)
  }

  return (
    <div className="space-y-3">
      {tags.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Меток пока нет. Создайте первую ниже.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              selected={selectedIds.includes(tag.id)}
              removable={manageMode}
              onClick={() => (manageMode ? setTagToDelete(tag) : toggle(tag.id))}
            />
          ))}
        </div>
      )}

      {manageMode && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Нажмите на метку, чтобы удалить её у всех аниме.
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          maxLength={30}
          placeholder="Новая метка"
          aria-label="Название новой метки"
          className={INPUT_CLASSES}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={`${BUTTON_SECONDARY_CLASSES} shrink-0`}
          disabled={!newName.trim()}
          onClick={() => void handleCreate()}
        >
          Создать
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {tags.length > 0 && (
        <button
          type="button"
          className="text-sm text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={() => setManageMode((value) => !value)}
        >
          {manageMode ? 'Готово' : 'Удалить метки'}
        </button>
      )}

      <ConfirmDialog
        open={tagToDelete !== null}
        title="Удалить метку?"
        message={`Метка «${tagToDelete?.name ?? ''}» исчезнет у всех аниме. Это действие нельзя отменить.`}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setTagToDelete(null)}
      />
    </div>
  )
}

export default TagPicker
