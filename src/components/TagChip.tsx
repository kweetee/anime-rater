interface TagChipProps {
  label: string
  selected?: boolean // метка выбрана
  removable?: boolean // режим удаления: красная метка с крестиком
  onClick: () => void
}

// Одна метка-кнопка: выбрана / не выбрана / режим удаления
export function TagChip({
  label,
  selected = false,
  removable = false,
  onClick,
}: TagChipProps) {
  const base =
    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition'

  let state: string
  if (removable) {
    state =
      'border-red-400 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300'
  } else if (selected) {
    state = 'border-indigo-600 bg-indigo-600 text-white'
  } else {
    state =
      'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
  }

  return (
    <button
      type="button"
      aria-pressed={removable ? undefined : selected}
      onClick={onClick}
      className={`${base} ${state}`}
    >
      {label}
      {removable && <span aria-hidden="true">✕</span>}
    </button>
  )
}

export default TagChip
