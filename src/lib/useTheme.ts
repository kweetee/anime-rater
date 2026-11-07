import { useCallback, useEffect, useState } from 'react'

// Тема: «dark» (по умолчанию), «light» или «system» (как в системе)
export type ThemeMode = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'anime-rater-theme'

function readMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'system' || value === 'dark') return value
  } catch {
    // хранилище недоступно — используем тёмную тему
  }
  return 'dark'
}

// Ставит или снимает класс "dark" на <html> и красит полосу браузера на телефоне
function applyTheme(mode: ThemeMode) {
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? '#131110' : '#faf6ee')
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readMode)

  useEffect(() => {
    applyTheme(mode)
    if (mode !== 'system') return undefined
    // В режиме «как в системе» следим за переключением темы в самой системе
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // не критично: тема применится, но не запомнится
    }
    setModeState(next)
  }, [])

  return { mode, setMode }
}
