import type { NewsHeadline } from '@commodity-tracker/shared';

interface NewsSidebarProps {
  loading: boolean;
  headlines: NewsHeadline[];
}

export function NewsSidebar({ loading, headlines }: NewsSidebarProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-terminal-border bg-terminal-panel p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-terminal-text">Commodity News</h2>

      {loading ? (
        <div className="grid flex-1 place-items-center text-sm text-terminal-muted">Loading news feed...</div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {headlines.map((item) => (
            <article key={item.id} className="rounded border border-terminal-border/60 bg-terminal-card p-2">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-terminal-text hover:text-cyan-300"
              >
                {item.title}
              </a>
              <p className="mt-1 text-[11px] text-terminal-muted">
                {item.source} • {new Date(item.publishedAt).toLocaleString()}
              </p>
            </article>
          ))}

          {headlines.length === 0 ? (
            <p className="text-xs text-terminal-muted">No recent headlines for this commodity.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
