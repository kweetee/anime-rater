interface ToggleProps {
  label: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  title?: string
}

// Простой переключатель: квадратик и подпись (цвет берётся от родителя)
export function Toggle({ label, checked, onChange, disabled, title }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      className="inline-flex min-h-10 items-center gap-2 text-sm disabled:opacity-50"
      onClick={onChange}
    >
      <span
        aria-hidden="true"
        className="flex h-4 w-4 shrink-0 items-center justify-center border border-current"
      >
        {checked && <span className="h-2 w-2 bg-current" />}
      </span>
      {label}
    </button>
  )
}

export default Toggle
