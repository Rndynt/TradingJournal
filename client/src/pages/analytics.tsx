import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrades, useTradeStats } from "@/hooks/use-trades";
import { formatCurrency, formatPercentage } from "@/lib/utils/calculations";
import EquityCurve from "@/components/charts/equity-curve";
import PlDistribution from "@/components/charts/pl-distribution";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { data: trades = [], isLoading: tradesLoading } = useTrades();
  const { data: stats, isLoading: statsLoading } = useTradeStats();

  if (tradesLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const closedTrades = trades.filter(trade => trade.status === "closed");
  const winningTrades = closedTrades.filter(trade => parseFloat(trade.pnl || "0") > 0);
  const losingTrades = closedTrades.filter(trade => parseFloat(trade.pnl || "0") < 0);

  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || "0"), 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || "0"), 0) / losingTrades.length
    : 0;

  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

  // Calculate stats by instrument
  const instrumentStats = trades.reduce((acc, trade) => {
    if (!acc[trade.instrument]) {
      acc[trade.instrument] = {
        totalTrades: 0,
        winningTrades: 0,
        totalPnl: 0,
      };
    }
    
    acc[trade.instrument].totalTrades++;
    if (parseFloat(trade.pnl || "0") > 0) {
      acc[trade.instrument].winningTrades++;
    }
    acc[trade.instrument].totalPnl += parseFloat(trade.pnl || "0");
    
    return acc;
  }, {} as Record<string, { totalTrades: number; winningTrades: number; totalPnl: number }>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics & Performance</h2>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {stats ? `${stats.winRate.toFixed(1)}%` : "0%"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {winningTrades.length} wins out of {closedTrades.length} trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {profitFactor.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Gross profit / Gross loss
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Expectancy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {formatCurrency((avgWin + avgLoss) / 2)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Expected value per trade
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Average Win</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-profit">
              {formatCurrency(avgWin)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Per winning trade
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Average Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-loss">
              {formatCurrency(avgLoss)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Per losing trade
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">
              {stats ? `${stats.maxDrawdown.toFixed(1)}%` : "0%"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Maximum peak-to-trough decline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-white">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <EquityCurve trades={trades} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-white">P&L Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <PlDistribution trades={trades} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instrument Performance */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <CardTitle className="text-white">Performance by Instrument</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(instrumentStats).map(([instrument, stats]) => (
              <div key={instrument} className="flex items-center justify-between p-4 bg-dark-300 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{instrument}</h4>
                  <p className="text-sm text-gray-400">
                    {stats.totalTrades} trades • {((stats.winningTrades / stats.totalTrades) * 100).toFixed(1)}% win rate
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    stats.totalPnl >= 0 ? "text-profit" : "text-loss"
                  )}>
                    {formatCurrency(stats.totalPnl)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {stats.winningTrades}/{stats.totalTrades} wins
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
