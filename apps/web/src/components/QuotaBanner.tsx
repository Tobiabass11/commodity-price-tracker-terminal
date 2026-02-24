interface QuotaBannerProps {
  show: boolean;
  message?: string;
}

export function QuotaBanner({ show, message }: QuotaBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-lg border border-terminal-amber/60 bg-terminal-amber/10 px-4 py-3 text-sm text-terminal-amber">
      API quota exhausted. Showing last cached data. {message ? `(${message})` : ''}
    </div>
  );
}
