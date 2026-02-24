export function formatPrice(value: number): string {
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    });
  }

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

export function formatChange(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${abs.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export function formatDateTime(dateIso: string): string {
  return new Date(dateIso).toLocaleString();
}
