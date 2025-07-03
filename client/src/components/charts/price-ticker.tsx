
import { usePrices } from '@/hooks/use-prices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/calculations';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceTickerProps {
  symbols?: string[];
  compact?: boolean;
}

export default function PriceTicker({ symbols, compact = false }: PriceTickerProps) {
  const { prices, isLoading } = usePrices(symbols);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-dark-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const priceArray = Array.from(prices.values());

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {priceArray.map((priceData) => (
          <Badge
            key={priceData.symbol}
            variant="secondary"
            className={cn(
              "flex items-center space-x-1 px-3 py-1",
              priceData.changePercent > 0
                ? "bg-profit/20 text-profit"
                : priceData.changePercent < 0
                ? "bg-loss/20 text-loss"
                : "bg-gray-500/20 text-gray-400"
            )}
          >
            <span className="font-medium">{priceData.symbol}</span>
            <span>{formatCurrency(priceData.price)}</span>
            {priceData.changePercent > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : priceData.changePercent < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {priceArray.map((priceData) => (
        <Card key={priceData.symbol} className="bg-dark-200 border-dark-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{priceData.symbol}</h3>
              {priceData.changePercent > 0 ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : priceData.changePercent < 0 ? (
                <TrendingDown className="h-4 w-4 text-loss" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(priceData.price)}
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    priceData.changePercent > 0
                      ? "text-profit"
                      : priceData.changePercent < 0
                      ? "text-loss"
                      : "text-gray-400"
                  )}
                >
                  {priceData.changePercent > 0 ? "+" : ""}
                  {priceData.changePercent.toFixed(2)}%
                </span>
                <span
                  className={cn(
                    "text-xs",
                    priceData.changePercent > 0
                      ? "text-profit"
                      : priceData.changePercent < 0
                      ? "text-loss"
                      : "text-gray-400"
                  )}
                >
                  ({priceData.change > 0 ? "+" : ""}{formatCurrency(priceData.change)})
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Updated: {priceData.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
