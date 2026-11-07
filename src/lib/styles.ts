// ЕДИНОЕ место, где задан стиль эталона.
// Главная, тир-лист и калибровка берут классы только отсюда.
export const REFERENCE_CARD_CLASSES =
  'border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-950/40'

export const NORMAL_CARD_CLASSES =
  'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'

export function cardStateClasses(isReference: boolean): string {
  return isReference ? REFERENCE_CARD_CLASSES : NORMAL_CARD_CLASSES
}

// Значок «★ Эталон»
export const REFERENCE_BADGE_CLASSES =
  'inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white'

// Маленькая звёздочка в углу плитки (в тир-листе нет места для значка)
export const REFERENCE_STAR_CLASSES =
  'absolute left-0.5 top-0.5 rounded bg-green-600 px-1 text-[10px] font-semibold leading-4 text-white'

// Кнопка-переключатель «Только эталоны»: выключена / включена
export const REFERENCE_TOGGLE_OFF_CLASSES =
  'border-slate-300 bg-white text-slate-700 hover:border-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
export const REFERENCE_TOGGLE_ON_CLASSES =
  'border-green-600 bg-green-600 text-white'
