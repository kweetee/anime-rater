import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Просим браузер не стирать базу при нехватке места на устройстве.
// Если не разрешит — ничего страшного, поэтому ошибки игнорируем.
try {
  void navigator.storage?.persist?.()
} catch {
  // не критично
}

// Точка входа: оборачиваем приложение в роутер.
// HashRouter (адреса вида /#/tierlist) нужен для GitHub Pages:
// там нет сервера, который умел бы открывать /tierlist после обновления страницы.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
