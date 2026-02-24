import type { AlertDirection, ChartRange, CommoditySymbol } from '@commodity-tracker/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AlertRuleState {
  direction: AlertDirection;
  threshold: number;
  enabled: boolean;
}

interface MarketStore {
  selectedSymbol: CommoditySymbol;
  selectedRange: ChartRange;
  watchlist: CommoditySymbol[];
  alertRules: Partial<Record<CommoditySymbol, AlertRuleState>>;
  highlightedSymbol?: CommoditySymbol;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  setSelectedSymbol: (symbol: CommoditySymbol) => void;
  setSelectedRange: (range: ChartRange) => void;
  toggleWatchlist: (symbol: CommoditySymbol) => void;
  updateAlertRule: (
    symbol: CommoditySymbol,
    input: Partial<AlertRuleState> & Pick<AlertRuleState, 'threshold'>
  ) => void;
  setAlertEnabled: (symbol: CommoditySymbol, enabled: boolean) => void;
  setHighlightedSymbol: (symbol?: CommoditySymbol) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
}

export const useMarketStore = create<MarketStore>()(
  persist(
    (set, get) => ({
      selectedSymbol: 'WTI',
      selectedRange: '1M',
      watchlist: ['WTI', 'BRENT', 'GOLD'],
      alertRules: {},
      highlightedSymbol: undefined,
      soundEnabled: true,
      browserNotificationsEnabled: false,
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      setSelectedRange: (range) => set({ selectedRange: range }),
      toggleWatchlist: (symbol) => {
        const current = get().watchlist;
        if (current.includes(symbol)) {
          set({ watchlist: current.filter((item) => item !== symbol) });
          return;
        }
        set({ watchlist: [...current, symbol] });
      },
      updateAlertRule: (symbol, input) => {
        const current = get().alertRules[symbol];
        set({
          alertRules: {
            ...get().alertRules,
            [symbol]: {
              direction: input.direction ?? current?.direction ?? 'above',
              threshold: input.threshold,
              enabled: input.enabled ?? current?.enabled ?? true
            }
          }
        });
      },
      setAlertEnabled: (symbol, enabled) => {
        const current = get().alertRules[symbol];
        if (!current) {
          return;
        }
        set({
          alertRules: {
            ...get().alertRules,
            [symbol]: {
              ...current,
              enabled
            }
          }
        });
      },
      setHighlightedSymbol: (symbol) => set({ highlightedSymbol: symbol }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setBrowserNotificationsEnabled: (enabled) => set({ browserNotificationsEnabled: enabled })
    }),
    {
      name: 'commodity-market-store',
      partialize: (state) => ({
        watchlist: state.watchlist,
        alertRules: state.alertRules,
        soundEnabled: state.soundEnabled,
        browserNotificationsEnabled: state.browserNotificationsEnabled
      })
    }
  )
);
