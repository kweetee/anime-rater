// Палитра цветов для тиров (выбор кнопками, надёжно на телефоне)
export const TIER_COLORS = [
  '#ef4444', // красный
  '#f97316', // оранжевый
  '#eab308', // жёлтый
  '#22c55e', // зелёный
  '#14b8a6', // бирюзовый
  '#3b82f6', // синий
  '#8b5cf6', // фиолетовый
  '#ec4899', // розовый
  '#64748b', // серый
  '#a16207', // коричневый
]

// Выбирает читаемый цвет текста (тёмный или белый) для фона заданного цвета
export function readableTextColor(hex: string): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  // Простая оценка яркости цвета (0..1)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0f172a' : '#ffffff'
}
