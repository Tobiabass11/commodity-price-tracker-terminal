import type {
  ChartRange,
  CommoditySymbol,
  HistoryResponse,
  NewsResponse,
  SnapshotResponse
} from '@commodity-tracker/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(payload.error ?? 'Request failed');
  }

  return (await response.json()) as T;
}

export function fetchSnapshot(): Promise<SnapshotResponse> {
  return request<SnapshotResponse>('/api/commodities/snapshot');
}

export function fetchHistory(symbol: CommoditySymbol, range: ChartRange): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/api/commodities/${symbol}/history?range=${range}`);
}

export function fetchNews(symbol: CommoditySymbol): Promise<NewsResponse> {
  return request<NewsResponse>(`/api/news?commodity=${symbol}`);
}
