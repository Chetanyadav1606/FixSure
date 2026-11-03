export function PageShell({ title, intro, children, narrow = true }: { title: string; intro?: string; children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className={`mx-auto px-4 py-12 ${narrow ? "max-w-3xl" : "max-w-5xl"}`}>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-lg leading-8 text-muted">{intro}</p>}
      <div className="mt-8 space-y-6 leading-7 text-ink/90 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-ink [&_a]:font-semibold [&_a]:text-blue-400 [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}
