import { useState } from 'react'

// Режим тир-листа: автоматически по оценкам или свой (с перетаскиванием)
export type TierMode = 'ratings' | 'custom'

const STORAGE_KEY = 'anime-rater-tier-mode'

function load(): TierMode {
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'custom') return 'custom'
  } catch {
    // localStorage недоступен: не страшно
  }
  return 'ratings'
}

// Выбранный режим запоминается в браузере
export function useTierMode(): [TierMode, (mode: TierMode) => void] {
  const [mode, setModeState] = useState<TierMode>(load)

  function setMode(next: TierMode) {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // не сохранилось: не страшно
    }
  }

  return [mode, setMode]
}
