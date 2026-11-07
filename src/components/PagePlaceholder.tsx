interface PagePlaceholderProps {
  title: string
  description: string
}

// Временная заглушка страницы. Заменим на настоящее содержимое на следующих этапах.
export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
    </section>
  )
}