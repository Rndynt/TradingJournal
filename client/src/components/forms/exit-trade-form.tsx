import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateTrade } from "@/hooks/use-trades";
import { useToast } from "@/hooks/use-toast";
import { calculatePnL, formatCurrency } from "@/lib/utils/calculations";
import { cn } from "@/lib/utils";
import type { Trade } from "@shared/schema";

const exitTradeSchema = z.object({
  exitPrice: z.string().min(1, "Exit price is required"),
  exitReason: z.string().min(1, "Exit reason is required"),
  notes: z.string().optional(),
});

type ExitTradeData = z.infer<typeof exitTradeSchema>;

interface ExitTradeFormProps {
  trade: Trade;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const exitReasons = [
  { value: "tp_full", label: "TP Hit (Full)" },
  { value: "tp_partial", label: "TP Hit (Partial)" },
  { value: "sl_hit", label: "SL Hit" },
  { value: "stopout", label: "Stopout / Margin Call" },
  { value: "manual_news", label: "Manual Exit (News)" },
  { value: "manual_technical", label: "Manual Exit (Technical)" },
  { value: "time_based", label: "Time-Based Exit" },
  { value: "reversal", label: "Reversal Signal" },
  { value: "breakeven", label: "Breakeven Exit" },
  { value: "trailing_stop", label: "Trailing Stop" },
];

export default function ExitTradeForm({ trade, onSuccess, onCancel }: ExitTradeFormProps) {
  const { toast } = useToast();
  const updateTrade = useUpdateTrade();

  const form = useForm<ExitTradeData>({
    resolver: zodResolver(exitTradeSchema),
    defaultValues: {
      exitPrice: "",
      exitReason: "",
      notes: "",
    },
  });

  const watchedExitPrice = form.watch("exitPrice");

  // Calculate potential P&L
  const potentialPnL = watchedExitPrice ? calculatePnL(
    parseFloat(trade.entryPrice),
    parseFloat(watchedExitPrice),
    parseFloat(trade.lotSize),
    trade.direction as "long" | "short"
  ) : 0;

  const potentialPnLPercentage = potentialPnL !== 0 
    ? (potentialPnL / parseFloat(trade.startBalance)) * 100 
    : 0;

  const onSubmit = async (data: ExitTradeData) => {
    try {
      const updatedData = {
        id: trade.id,
        exitPrice: data.exitPrice,
        exitReason: data.exitReason,
        status: "closed",
        exitDate: new Date(),
        notes: data.notes || trade.notes,
        pnl: potentialPnL.toFixed(2),
        pnlPercentage: potentialPnLPercentage.toFixed(2),
      };

      await updateTrade.mutateAsync(updatedData);
      
      toast({
        title: "Trade Closed",
        description: `Trade closed with ${potentialPnL >= 0 ? 'profit' : 'loss'} of ${formatCurrency(Math.abs(potentialPnL))}`,
        variant: potentialPnL >= 0 ? "default" : "destructive",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-dark-200 border-dark-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Close Trade: {trade.instrument}
          <Badge 
            variant="secondary" 
            className={cn(
              trade.direction === "long" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
            )}
          >
            {trade.direction.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Trade Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-dark-300 rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Entry Price</p>
              <p className="text-sm font-medium text-white">{formatCurrency(parseFloat(trade.entryPrice))}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Stop Loss</p>
              <p className="text-sm font-medium text-white">
                {trade.stopLoss ? formatCurrency(parseFloat(trade.stopLoss)) : "No SL"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Take Profit</p>
              <p className="text-sm font-medium text-white">
                {trade.takeProfit ? formatCurrency(parseFloat(trade.takeProfit)) : "No TP"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Lot Size</p>
              <p className="text-sm font-medium text-white">{trade.lotSize}</p>
            </div>
          </div>

          {/* Exit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="exitPrice" className="text-gray-400">Exit Price *</Label>
                <Input
                  {...form.register("exitPrice")}
                  type="number"
                  step="0.01"
                  placeholder="Enter exit price"
                  className="bg-dark-300 border-dark-400 text-white"
                />
                {form.formState.errors.exitPrice && (
                  <p className="text-sm text-loss mt-1">{form.formState.errors.exitPrice.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="exitReason" className="text-gray-400">Exit Reason *</Label>
                <Select onValueChange={(value) => form.setValue("exitReason", value)}>
                  <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                    <SelectValue placeholder="Select exit reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-300 border-dark-400">
                    {exitReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.exitReason && (
                  <p className="text-sm text-loss mt-1">{form.formState.errors.exitReason.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* P&L Preview */}
              {watchedExitPrice && (
                <div className="p-4 bg-dark-300 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">P&L Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">P&L Amount:</span>
                      <span className={cn(
                        "text-sm font-medium",
                        potentialPnL >= 0 ? "text-profit" : "text-loss"
                      )}>
                        {formatCurrency(potentialPnL)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">P&L Percentage:</span>
                      <span className={cn(
                        "text-sm font-medium",
                        potentialPnL >= 0 ? "text-profit" : "text-loss"
                      )}>
                        {potentialPnLPercentage >= 0 ? "+" : ""}{potentialPnLPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">New Balance:</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(parseFloat(trade.currentEquity) + potentialPnL)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exit Notes */}
          <div>
            <Label htmlFor="notes" className="text-gray-400">Exit Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Add notes about why you closed this trade..."
              className="bg-dark-300 border-dark-400 text-white"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-dark-400 text-gray-300 hover:bg-dark-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateTrade.isPending}
              className={cn(
                "text-white",
                potentialPnL >= 0 ? "bg-profit hover:bg-green-600" : "bg-loss hover:bg-red-600"
              )}
            >
              {updateTrade.isPending ? "Closing..." : "Close Trade"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}