// ЕДИНОЕ место, где задан стиль эталона.
// Главная, тир-лист и калибровка берут классы только отсюда.
// Эталон = самая тёмная (в тёмной теме самая светлая) толстая рамка + звёздочка рядом с оценкой
// (звёздочку рисует компонент RatingMark).
// Толщину рамки задаёт тот, кто использует класс: [--fw:2px].
export const REFERENCE_CARD_CLASSES =
  'frame bg-slate-100 [--fr:var(--color-slate-900)] dark:bg-slate-800 dark:[--fr:var(--color-slate-50)]'

export const NORMAL_CARD_CLASSES = 'frame bg-white dark:bg-slate-900'

export function cardStateClasses(isReference: boolean): string {
  return isReference ? REFERENCE_CARD_CLASSES : NORMAL_CARD_CLASSES
}
