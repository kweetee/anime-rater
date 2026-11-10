import { useState } from 'react'

// Как показывать список аниме на главной
export type ViewMode = 'small' | 'list'

export const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'small', label: 'Мелко' },
  { value: 'list', label: 'Список' },
]

const STORAGE_KEY = 'anime-rater-view'

function load(): ViewMode {
  try {
    // Старое значение «крупно» убрано: показываем «мелко»
    if (localStorage.getItem(STORAGE_KEY) === 'list') return 'list'
  } catch {
    // localStorage недоступен: не страшно
  }
  return 'small'
}

// Выбранный вид запоминается в браузере
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setModeState] = useState<ViewMode>(load)

  function setMode(next: ViewMode) {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // не сохранилось: не страшно
    }
  }

  return [mode, setMode]
}
