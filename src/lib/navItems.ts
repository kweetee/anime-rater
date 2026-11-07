// Пункты навигации: используются и в нижней панели (телефон), и в верхней (ПК)
export interface NavItem {
  to: string
  label: string
  icon: string // эмодзи, чтобы не подключать библиотеку иконок
  end?: boolean // true, если ссылка активна только при точном совпадении пути
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Главная', icon: '🏠', end: true },
  { to: '/tierlist', label: 'Тир-лист', icon: '🏆' },
  { to: '/calibration', label: 'Калибровка', icon: '🎯' },
  { to: '/settings', label: 'Данные', icon: '⚙️' },
]