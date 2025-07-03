import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Filter, X } from "lucide-react";
import { useFilteredTrades } from "@/hooks/use-trades";
import { formatCurrency } from "@/lib/utils/calculations";
import TradeTable from "@/components/tables/trade-table";
import ExitTradeForm from "@/components/forms/exit-trade-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { TradeFilter } from "@/types/trade";
import type { Trade } from "@shared/schema";

export default function TradeHistory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTradeForExit, setSelectedTradeForExit] = useState<Trade | null>(null);
  const [filter, setFilter] = useState<TradeFilter>({
    instrument: "all",
    session: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  const { data: trades = [], isLoading } = useFilteredTrades(filter);

  const handleFilterChange = (key: keyof TradeFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (trade: Trade) => {
    setLocation(`/trade-entry/${trade.id}`);
  };

  const handleView = (trade: Trade) => {
    if (trade.status === "open") {
      setSelectedTradeForExit(trade);
    } else {
      toast({
        title: "Trade Details",
        description: `Viewing ${trade.instrument} trade from ${new Date(trade.entryDate).toLocaleDateString()}`,
      });
    }
  };

  const handleExport = () => {
    const csvData = trades.map(trade => ({
      Date: new Date(trade.entryDate).toLocaleDateString(),
      Instrument: trade.instrument,
      Session: trade.session,
      Direction: trade.direction,
      "Entry Price": trade.entryPrice,
      "Exit Price": trade.exitPrice || "",
      "P&L": trade.pnl || "",
      Status: trade.status,
      "Exit Reason": trade.exitReason || "",
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trade-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Trade history has been exported to CSV.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-white">Trade History</h2>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Button
            onClick={handleExport}
            className="bg-dark-300 text-white hover:bg-dark-400"
            disabled={trades.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button className="bg-info text-white hover:bg-blue-600">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="instrument" className="text-gray-400">Instrument</Label>
              <Select
                value={filter.instrument}
                onValueChange={(value) => handleFilterChange("instrument", value)}
              >
                <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-300 border-dark-400">
                  <SelectItem value="all">All Instruments</SelectItem>
                  <SelectItem value="XAUUSD">XAUUSD</SelectItem>
                  <SelectItem value="BTCUSD">BTCUSD</SelectItem>
                  <SelectItem value="ETHUSD">ETHUSD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="session" className="text-gray-400">Session</Label>
              <Select
                value={filter.session}
                onValueChange={(value) => handleFilterChange("session", value)}
              >
                <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-300 border-dark-400">
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="newyork">New York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate" className="text-gray-400">Start Date</Label>
              <Input
                type="date"
                value={filter.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-gray-400">End Date</Label>
              <Input
                type="date"
                value={filter.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-400">Status</Label>
              <Select
                value={filter.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-300 border-dark-400">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade History Table */}
      <Card className="bg-dark-200 border-dark-300">
        <CardContent className="p-0">
          <TradeTable
            trades={trades}
            onEdit={handleEdit}
            onView={handleView}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {trades.length > 0 && (
        <Card className="bg-dark-200 border-dark-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-white">{trades.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Winning Trades</p>
                <p className="text-2xl font-bold text-profit">
                  {trades.filter(t => parseFloat(t.pnl || "0") > 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Losing Trades</p>
                <p className="text-2xl font-bold text-loss">
                  {trades.filter(t => parseFloat(t.pnl || "0") < 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(trades.reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exit Trade Dialog */}
      <Dialog open={!!selectedTradeForExit} onOpenChange={() => setSelectedTradeForExit(null)}>
        <DialogContent className="max-w-4xl bg-dark-100 border-dark-300">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Close Trade
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTradeForExit(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedTradeForExit && (
            <ExitTradeForm
              trade={selectedTradeForExit}
              onSuccess={() => setSelectedTradeForExit(null)}
              onCancel={() => setSelectedTradeForExit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
