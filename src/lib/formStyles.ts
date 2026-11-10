// Общие классы для полей форм и кнопок (чтобы не копировать их в каждом компоненте).
// Интерфейс чёрно-белый: чёрное на светлой теме, белое на тёмной.
export const INPUT_CLASSES =
  'w-full border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-white'

export const BUTTON_SECONDARY_CLASSES =
  'inline-flex min-h-10 items-center border border-slate-300 bg-transparent px-4 py-2 text-sm text-slate-900 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'

export const BUTTON_PRIMARY_CLASSES =
  'min-h-10 bg-slate-900 px-5 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'

export const BUTTON_DANGER_CLASSES =
  'min-h-10 border border-slate-900 bg-transparent px-5 py-2 text-sm text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-950'

export const LABEL_CLASSES =
  'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'

// Метки-кнопки (метки, типы, выбор оценки, переключатель темы): база + выбрана / не выбрана
export const CHIP_BASE =
  'inline-flex min-h-9 items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors'
export const CHIP_SELECTED =
  'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
export const CHIP_UNSELECTED =
  'border-slate-300 bg-transparent text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
