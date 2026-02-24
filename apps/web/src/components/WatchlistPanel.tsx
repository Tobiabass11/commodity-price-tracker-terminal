import { COMMODITY_LABELS, type CommodityQuote, type CommoditySymbol } from '@commodity-tracker/shared';
import clsx from 'clsx';

import { formatPrice } from '../lib/format';
import { useMarketStore } from '../store/useMarketStore';

interface WatchlistPanelProps {
  quotes: CommodityQuote[];
  watchlist: CommoditySymbol[];
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  onToggleWatchlist: (symbol: CommoditySymbol) => void;
  onToggleSound: (enabled: boolean) => void;
  onToggleBrowserNotifications: (enabled: boolean) => void;
}

export function WatchlistPanel({
  quotes,
  watchlist,
  soundEnabled,
  browserNotificationsEnabled,
  onToggleWatchlist,
  onToggleSound,
  onToggleBrowserNotifications
}: WatchlistPanelProps) {
  const alertRules = useMarketStore((state) => state.alertRules);
  const updateAlertRule = useMarketStore((state) => state.updateAlertRule);
  const setAlertEnabled = useMarketStore((state) => state.setAlertEnabled);

  return (
    <section className="rounded-xl border border-terminal-border bg-terminal-panel p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-terminal-text">Watchlist & Alerts</h2>
      </div>

      <div className="mb-4 flex flex-col gap-2 text-xs text-terminal-muted">
        <label className="flex items-center justify-between gap-2">
          <span>Sound Alerts</span>
          <input type="checkbox" checked={soundEnabled} onChange={(event) => onToggleSound(event.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-2">
          <span>Browser Notifications</span>
          <input
            type="checkbox"
            checked={browserNotificationsEnabled}
            onChange={(event) => onToggleBrowserNotifications(event.target.checked)}
          />
        </label>
      </div>

      <div className="space-y-2">
        {quotes.map((quote) => {
          const rule = alertRules[quote.symbol];
          return (
            <div key={quote.symbol} className="rounded border border-terminal-border/70 bg-terminal-card p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleWatchlist(quote.symbol)}
                  className={clsx(
                    'rounded px-2 py-1 text-[10px] font-semibold uppercase',
                    watchlist.includes(quote.symbol)
                      ? 'bg-terminal-amber/20 text-terminal-amber'
                      : 'bg-terminal-border/70 text-terminal-muted'
                  )}
                >
                  {watchlist.includes(quote.symbol) ? 'Watching' : 'Watch'}
                </button>

                <p className="font-mono text-xs text-terminal-text">{quote.symbol.replace('_', ' ')}</p>
                <p className="font-mono text-xs text-terminal-muted">{formatPrice(quote.price)}</p>
              </div>

              <div className="grid grid-cols-4 items-center gap-2 text-xs">
                <select
                  value={rule?.direction ?? 'above'}
                  className="rounded border border-terminal-border bg-[#0f1727] p-1 text-terminal-text"
                  onChange={(event) =>
                    updateAlertRule(quote.symbol, {
                      direction: event.target.value as 'above' | 'below',
                      threshold: rule?.threshold ?? quote.price,
                      enabled: rule?.enabled ?? true
                    })
                  }
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>

                <input
                  type="number"
                  value={rule?.threshold ?? quote.price}
                  onChange={(event) =>
                    updateAlertRule(quote.symbol, {
                      threshold: Number(event.target.value),
                      direction: rule?.direction ?? 'above',
                      enabled: rule?.enabled ?? true
                    })
                  }
                  className="col-span-2 rounded border border-terminal-border bg-[#0f1727] p-1 font-mono text-terminal-text"
                />

                <input
                  type="checkbox"
                  checked={rule?.enabled ?? false}
                  onChange={(event) => {
                    if (!rule) {
                      updateAlertRule(quote.symbol, {
                        threshold: quote.price,
                        direction: 'above',
                        enabled: event.target.checked
                      });
                      return;
                    }
                    setAlertEnabled(quote.symbol, event.target.checked);
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-terminal-muted">{COMMODITY_LABELS[quote.symbol]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
