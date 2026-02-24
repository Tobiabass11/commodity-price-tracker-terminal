import type { CommodityQuote } from '@commodity-tracker/shared';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function createSimulatedQuote(quote: CommodityQuote): CommodityQuote {
  const drift = (Math.random() - 0.5) * quote.price * 0.0015;
  const nextPrice = clamp(quote.price + drift, quote.price * 0.985, quote.price * 1.015);
  const change = nextPrice - quote.previousClose;
  const changePercent = quote.previousClose === 0 ? 0 : (change / quote.previousClose) * 100;

  return {
    ...quote,
    price: Number(nextPrice.toFixed(4)),
    change: Number(change.toFixed(4)),
    changePercent: Number(changePercent.toFixed(4)),
    simulated: true,
    updatedAt: new Date().toISOString()
  };
}
