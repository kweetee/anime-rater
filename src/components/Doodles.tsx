// Маленькие SVG-значки (цвет берётся из текста: text-...).
interface IconProps {
  className?: string
}

// Звёздочка (для эталонов)
export function StarIcon({ className = 'h-3 w-3' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.6 6 20.9l1.3-6.7-5-4.7 6.8-.8z" />
    </svg>
  )
}

// Крестик (удаление метки, закрытие сообщения)
export function CrossIcon({ className = 'h-3 w-3' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}
