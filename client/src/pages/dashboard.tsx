import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  TrendingDown, 
  Activity,
  Plus,
  ArrowRight,
  Target
} from "lucide-react";
import { useTrades, useTradeStats } from "@/hooks/use-trades";
import { formatCurrency } from "@/lib/utils/calculations";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import PriceTicker from "@/components/charts/price-ticker";
import { getSessionLabel } from "@/lib/utils/session-detector";
import EquityCurve from "@/components/charts/equity-curve";
import PlDistribution from "@/components/charts/pl-distribution";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: trades = [], isLoading: tradesLoading } = useTrades();
  const { data: stats, isLoading: statsLoading } = useTradeStats();

  const recentTrades = trades.slice(0, 5);

  const getDirectionBadge = (direction: string) => {
    const isLong = direction === "long";
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "text-xs",
          isLong ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
        )}
      >
        {direction.toUpperCase()}
      </Badge>
    );
  };

  if (tradesLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Dashboard</h2>
          <p className="text-gray-400 mt-1">Monitor your trading performance and active positions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/trade-entry">
            <Button className="bg-info text-white hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Prices */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-profit" />
            <span>Current Prices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PriceTicker compact={true} />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-profit" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Win Rate</h3>
                <p className="text-2xl font-bold text-white">
                  {stats ? `${stats.winRate.toFixed(1)}%` : "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-profit" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Total P&L</h3>
                <p className={cn(
                  "text-2xl font-bold",
                  stats && stats.totalPnl >= 0 ? "text-profit" : "text-loss"
                )}>
                  {stats ? formatCurrency(stats.totalPnl) : "$0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-warning" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Max Drawdown</h3>
                <p className="text-2xl font-bold text-white">
                  {stats ? `${stats.maxDrawdown.toFixed(1)}%` : "0%"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-info" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Active Trades</h3>
                <p className="text-2xl font-bold text-white">
                  {stats ? stats.activeTrades : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve Chart */}
        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-white">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <EquityCurve trades={trades} />
            </div>
          </CardContent>
        </Card>

        {/* P&L Distribution */}
        <Card className="bg-dark-200 border-dark-300">
          <CardHeader>
            <CardTitle className="text-white">P&L Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <PlDistribution trades={trades} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader className="border-b border-dark-300">
          <CardTitle className="text-white">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-300">
              <thead className="bg-dark-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Entry Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Exit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark-200 divide-y divide-dark-300">
                {recentTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {trade.instrument}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getDirectionBadge(trade.direction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(parseFloat(trade.entryPrice))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {trade.exitPrice ? formatCurrency(parseFloat(trade.exitPrice)) : "-"}
                    </td>
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm font-medium",
                      parseFloat(trade.pnl || "0") >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {trade.pnl ? formatCurrency(parseFloat(trade.pnl)) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(trade.entryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-dark-300">
            <Link href="/history">
              <Button variant="link" className="text-info hover:text-blue-400 p-0">
                View all trades
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}