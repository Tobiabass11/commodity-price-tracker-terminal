import type { ChartRange, CommoditySymbol } from '@commodity-tracker/shared';
import { useQuery } from '@tanstack/react-query';

import { fetchHistory, fetchNews, fetchSnapshot } from '../lib/api';

export function useSnapshotQuery() {
  return useQuery({
    queryKey: ['snapshot'],
    queryFn: fetchSnapshot,
    staleTime: 25000,
    refetchInterval: 30000
  });
}

export function useHistoryQuery(symbol: CommoditySymbol, range: ChartRange) {
  return useQuery({
    queryKey: ['history', symbol, range],
    queryFn: () => fetchHistory(symbol, range),
    staleTime: 120000
  });
}

export function useNewsQuery(symbol: CommoditySymbol) {
  return useQuery({
    queryKey: ['news', symbol],
    queryFn: () => fetchNews(symbol),
    staleTime: 240000,
    refetchInterval: 300000
  });
}
