export function RichContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-primary-700 prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
