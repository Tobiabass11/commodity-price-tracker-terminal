export class QuotaExceededError extends Error {
  constructor(message = 'Provider quota exhausted') {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderError';
  }
}
