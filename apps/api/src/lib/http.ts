import { ProviderError, QuotaExceededError } from './errors.js';

export async function fetchJson<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      if (response.status === 429) {
        throw new QuotaExceededError('HTTP 429 from data provider');
      }
      throw new ProviderError(`Provider request failed with status ${response.status}`);
    }

    if (typeof payload.Note === 'string' || typeof payload.Information === 'string') {
      throw new QuotaExceededError(String(payload.Note ?? payload.Information));
    }

    return payload as T;
  } catch (error) {
    if (error instanceof QuotaExceededError || error instanceof ProviderError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProviderError('Provider request timed out');
    }

    throw new ProviderError('Provider request failed');
  } finally {
    clearTimeout(timeout);
  }
}
