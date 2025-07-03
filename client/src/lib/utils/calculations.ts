export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  lotSize: number,
  direction: "long" | "short"
): number {
  const priceDiff = exitPrice - entryPrice;
  const multiplier = direction === "long" ? 1 : -1;
  return priceDiff * lotSize * multiplier;
}

export function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  return risk > 0 ? reward / risk : 0;
}

export function calculateRiskPercentage(
  entryPrice: number,
  stopLoss: number,
  lotSize: number,
  accountBalance: number
): number {
  const risk = Math.abs(entryPrice - stopLoss) * lotSize;
  return (risk / accountBalance) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
}
