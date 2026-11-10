import { CrossIcon } from './Doodles'
import { CHIP_BASE, CHIP_SELECTED, CHIP_UNSELECTED } from '../lib/formStyles'

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
  let state: string
  if (removable) {
    state =
      'border-slate-900 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-white dark:text-white dark:hover:bg-slate-800'
  } else if (selected) {
    state = CHIP_SELECTED
  } else {
    state = CHIP_UNSELECTED
  }

  return (
    <button
      type="button"
      aria-pressed={removable ? undefined : selected}
      onClick={onClick}
      className={`${CHIP_BASE} ${state}`}
    >
      {label}
      {removable && <CrossIcon className="h-2.5 w-2.5" />}
    </button>
  )
}

export default TagChip
