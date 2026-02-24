import { COMMODITY_SYMBOLS } from '@commodity-tracker/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { CommodityGrid } from './components/CommodityGrid';
import { DetailPanel } from './components/DetailPanel';
import { NewsSidebar } from './components/NewsSidebar';
import { QuotaBanner } from './components/QuotaBanner';
import { WatchlistPanel } from './components/WatchlistPanel';
import { useHistoryQuery, useNewsQuery, useSnapshotQuery } from './hooks/useMarketData';
import { useSimulatedQuotes } from './hooks/useSimulatedQuotes';
import { didCrossThreshold } from './lib/alerts';
import { playAlertSound } from './lib/audio';
import { formatDateTime } from './lib/format';
import { useMarketStore } from './store/useMarketStore';

interface SparklinePoint {
  time: number;
  price: number;
}

export default function App() {
  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const selectedRange = useMarketStore((state) => state.selectedRange);
  const watchlist = useMarketStore((state) => state.watchlist);
  const alertRules = useMarketStore((state) => state.alertRules);
  const highlightedSymbol = useMarketStore((state) => state.highlightedSymbol);
  const soundEnabled = useMarketStore((state) => state.soundEnabled);
  const browserNotificationsEnabled = useMarketStore((state) => state.browserNotificationsEnabled);

  const setSelectedSymbol = useMarketStore((state) => state.setSelectedSymbol);
  const setSelectedRange = useMarketStore((state) => state.setSelectedRange);
  const toggleWatchlist = useMarketStore((state) => state.toggleWatchlist);
  const setHighlightedSymbol = useMarketStore((state) => state.setHighlightedSymbol);
  const setSoundEnabled = useMarketStore((state) => state.setSoundEnabled);
  const setBrowserNotificationsEnabled = useMarketStore((state) => state.setBrowserNotificationsEnabled);

  const snapshotQuery = useSnapshotQuery();
  const realQuotes = useMemo(() => snapshotQuery.data?.data ?? [], [snapshotQuery.data]);
  const quotes = useSimulatedQuotes(realQuotes);

  const selectedQuote = useMemo(
    () => quotes.find((quote) => quote.symbol === selectedSymbol) ?? quotes[0],
    [quotes, selectedSymbol]
  );

  useEffect(() => {
    if (!selectedQuote) {
      return;
    }
    if (selectedQuote.symbol !== selectedSymbol) {
      setSelectedSymbol(selectedQuote.symbol);
    }
  }, [selectedQuote, selectedSymbol, setSelectedSymbol]);

  const historyQuery = useHistoryQuery(selectedSymbol, selectedRange);
  const newsQuery = useNewsQuery(selectedSymbol);

  const [sparklineData, setSparklineData] = useState<Partial<Record<string, SparklinePoint[]>>>({});
  const previousRealPrices = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (quotes.length === 0) {
      return;
    }

    setSparklineData((current) => {
      const next = { ...current };
      quotes.forEach((quote) => {
        const history = [...(next[quote.symbol] ?? []), { time: Date.now(), price: quote.price }];
        next[quote.symbol] = history.slice(-90);
      });
      return next;
    });
  }, [quotes]);

  useEffect(() => {
    realQuotes.forEach((quote) => {
      const rule = alertRules[quote.symbol];
      if (!rule || !rule.enabled || Number.isNaN(rule.threshold)) {
        previousRealPrices.current.set(quote.symbol, quote.price);
        return;
      }

      const previousPrice = previousRealPrices.current.get(quote.symbol) ?? quote.previousClose;
      const crossed = didCrossThreshold(previousPrice, quote.price, rule.threshold, rule.direction);
      previousRealPrices.current.set(quote.symbol, quote.price);

      if (!crossed) {
        return;
      }

      const directionLabel = rule.direction === 'above' ? 'rose above' : 'fell below';
      const message = `${quote.name} ${directionLabel} ${rule.threshold.toFixed(2)}`;

      toast(message, {
        duration: 5000,
        style: {
          background: '#0f1727',
          color: '#e5ecf3',
          border: '1px solid #334155'
        }
      });

      setHighlightedSymbol(quote.symbol);
      window.setTimeout(() => setHighlightedSymbol(undefined), 5000);

      if (browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Commodity Alert', {
          body: message
        });
      }

      if (soundEnabled) {
        playAlertSound();
      }
    });
  }, [alertRules, browserNotificationsEnabled, realQuotes, setHighlightedSymbol, soundEnabled]);

  const handleBrowserNotificationsToggle = async (enabled: boolean) => {
    if (!enabled) {
      setBrowserNotificationsEnabled(false);
      return;
    }

    if (!('Notification' in window)) {
      toast.error('Browser notifications are not available in this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      setBrowserNotificationsEnabled(true);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setBrowserNotificationsEnabled(true);
      toast.success('Browser notifications enabled.');
      return;
    }

    setBrowserNotificationsEnabled(false);
    toast.error('Notification permission denied.');
  };

  const connectionLabel = snapshotQuery.isError
    ? 'Disconnected'
    : snapshotQuery.isFetching
      ? 'Refreshing'
      : 'Live';

  return (
    <div className="min-h-screen bg-terminal-bg px-4 py-4 text-terminal-text lg:px-6">
      <div className="mx-auto flex max-w-[1900px] flex-col gap-4">
        <header className="rounded-xl border border-terminal-border bg-terminal-panel px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-terminal-muted">Front Office Style Dashboard</p>
              <h1 className="text-xl font-semibold text-terminal-text">Commodity Market Monitor</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div>
                <p className="text-[11px] uppercase text-terminal-muted">Connection</p>
                <p className="font-mono text-sm">{connectionLabel}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-terminal-muted">Last Refresh</p>
                <p className="font-mono text-sm">
                  {snapshotQuery.data?.meta.updatedAt
                    ? formatDateTime(snapshotQuery.data.meta.updatedAt)
                    : 'Waiting for data'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <QuotaBanner show={Boolean(snapshotQuery.data?.meta.quotaExhausted)} message={snapshotQuery.data?.meta.message} />

        <main className="grid gap-4 xl:grid-cols-12">
          <section className="xl:col-span-4">
            <CommodityGrid
              quotes={quotes}
              selectedSymbol={selectedSymbol}
              highlightedSymbol={highlightedSymbol}
              watchlist={watchlist}
              sparklineData={sparklineData}
              onSelect={setSelectedSymbol}
              onToggleWatchlist={toggleWatchlist}
            />
          </section>

          <section className="xl:col-span-5">
            <DetailPanel
              quote={selectedQuote}
              data={historyQuery.data?.data ?? []}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              loading={historyQuery.isLoading}
            />
          </section>

          <section className="flex min-h-[540px] flex-col gap-4 xl:col-span-3">
            <WatchlistPanel
              quotes={quotes.filter((quote) => COMMODITY_SYMBOLS.includes(quote.symbol))}
              watchlist={watchlist}
              soundEnabled={soundEnabled}
              browserNotificationsEnabled={browserNotificationsEnabled}
              onToggleWatchlist={toggleWatchlist}
              onToggleSound={setSoundEnabled}
              onToggleBrowserNotifications={(enabled) => {
                void handleBrowserNotificationsToggle(enabled);
              }}
            />
            <NewsSidebar loading={newsQuery.isLoading} headlines={newsQuery.data?.data ?? []} />
          </section>
        </main>
      </div>
    </div>
  );
}
