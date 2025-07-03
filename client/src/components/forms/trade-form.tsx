import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTradeSchema } from "@shared/schema";
import { detectSession } from "@/lib/utils/session-detector";
import { calculateRiskReward, calculateRiskPercentage } from "@/lib/utils/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateTrade, useUpdateTrade } from "@/hooks/use-trades";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { InsertTrade } from "@shared/schema";
import type { Trade } from "@shared/schema";

interface TradeFormProps {
  trade?: Trade;
  onSuccess?: () => void;
}

export default function TradeForm({ trade, onSuccess }: TradeFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();

  const form = useForm<InsertTrade>({
    resolver: zodResolver(insertTradeSchema),
    defaultValues: {
      instrument: trade?.instrument || "XAUUSD",
      session: trade?.session || detectSession(),
      marketBias: trade?.marketBias || "bull",
      biasNotes: trade?.biasNotes || "",
      orderType: trade?.orderType || "market",
      direction: trade?.direction || "long",
      entryPrice: trade?.entryPrice || "",
      stopLoss: trade?.stopLoss || "",
      takeProfit: trade?.takeProfit || "",
      exitPrice: trade?.exitPrice || "",
      lotSize: trade?.lotSize || "0.10",
      startBalance: trade?.startBalance || "10000.00",
      currentEquity: trade?.currentEquity || "10000.00",
      riskPercentage: trade?.riskPercentage || "2.0",
      status: trade?.status || "open",
      exitReason: trade?.exitReason || "",
      trendAnalysis: trade?.trendAnalysis || "",
      indicators: trade?.indicators || "",
      partialTpEnabled: trade?.partialTpEnabled || false,
      partialTpPercentage: trade?.partialTpPercentage || "",
      partialTpPrice: trade?.partialTpPrice || "",
      notes: trade?.notes || "",
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (watchedValues.entryPrice && watchedValues.stopLoss && watchedValues.takeProfit) {
      const rrRatio = calculateRiskReward(
        parseFloat(watchedValues.entryPrice),
        parseFloat(watchedValues.stopLoss),
        parseFloat(watchedValues.takeProfit)
      );
      form.setValue("rrRatio", rrRatio.toFixed(2));
    }
  }, [watchedValues.entryPrice, watchedValues.stopLoss, watchedValues.takeProfit, form]);

  const onSubmit = async (data: InsertTrade) => {
    try {
      if (trade) {
        await updateTrade.mutateAsync({ id: trade.id, ...data });
        toast({
          title: "Trade updated successfully",
          description: "Your trade has been updated.",
        });
      } else {
        await createTrade.mutateAsync(data);
        toast({
          title: "Trade created successfully",
          description: "Your trade has been saved.",
        });
      }
      
      onSuccess?.();
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Instrument & Session */}
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Instrument & Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instrument" className="text-gray-400">Instrument</Label>
                  <Select
                    value={watchedValues.instrument}
                    onValueChange={(value) => form.setValue("instrument", value)}
                  >
                    <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-300 border-dark-400">
                      <SelectItem value="XAUUSD">XAUUSD (Gold)</SelectItem>
                      <SelectItem value="BTCUSD">BTCUSD (Bitcoin)</SelectItem>
                      <SelectItem value="ETHUSD">ETHUSD (Ethereum)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="session" className="text-gray-400">Session</Label>
                  <Select
                    value={watchedValues.session}
                    onValueChange={(value) => form.setValue("session", value)}
                  >
                    <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-300 border-dark-400">
                      <SelectItem value="asia">Asia Session</SelectItem>
                      <SelectItem value="london">London Session</SelectItem>
                      <SelectItem value="newyork">New York Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance & Market Bias */}
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Balance & Market Bias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startBalance" className="text-gray-400">Start Balance</Label>
                  <Input
                    {...form.register("startBalance")}
                    type="number"
                    step="0.01"
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="currentEquity" className="text-gray-400">Current Equity</Label>
                  <Input
                    {...form.register("currentEquity")}
                    type="number"
                    step="0.01"
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-400 mb-2 block">Market Bias</Label>
                <RadioGroup
                  value={watchedValues.marketBias}
                  onValueChange={(value) => form.setValue("marketBias", value)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bull" id="bull" />
                    <Label htmlFor="bull" className="text-profit cursor-pointer">Bull</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bear" id="bear" />
                    <Label htmlFor="bear" className="text-loss cursor-pointer">Bear</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sideways" id="sideways" />
                    <Label htmlFor="sideways" className="text-warning cursor-pointer">Sideways</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Technical Analysis */}
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Technical Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trendAnalysis" className="text-gray-400">Trend Analysis</Label>
                <Textarea
                  {...form.register("trendAnalysis")}
                  placeholder="HH/HL pattern, price action notes..."
                  className="bg-dark-300 border-dark-400 text-white"
                />
              </div>
              <div>
                <Label htmlFor="indicators" className="text-gray-400">Indicators</Label>
                <Textarea
                  {...form.register("indicators")}
                  placeholder="EMA 20/50/200, RSI, MACD, Stochastic..."
                  className="bg-dark-300 border-dark-400 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Details */}
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderType" className="text-gray-400">Order Type</Label>
                  <Select
                    value={watchedValues.orderType}
                    onValueChange={(value) => form.setValue("orderType", value)}
                  >
                    <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-300 border-dark-400">
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="direction" className="text-gray-400">Direction</Label>
                  <Select
                    value={watchedValues.direction}
                    onValueChange={(value) => form.setValue("direction", value)}
                  >
                    <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-300 border-dark-400">
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="entryPrice" className="text-gray-400">Entry Price</Label>
                  <Input
                    {...form.register("entryPrice")}
                    type="number"
                    step="0.01"
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="stopLoss" className="text-gray-400">Stop Loss</Label>
                  <Input
                    {...form.register("stopLoss")}
                    type="number"
                    step="0.01"
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="takeProfit" className="text-gray-400">Take Profit</Label>
                  <Input
                    {...form.register("takeProfit")}
                    type="number"
                    step="0.01"
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lotSize" className="text-gray-400">Lot Size</Label>
                <Input
                  {...form.register("lotSize")}
                  type="number"
                  step="0.01"
                  className="bg-dark-300 border-dark-400 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Risk Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="riskPercentage" className="text-gray-400">Risk %</Label>
                  <Input
                    {...form.register("riskPercentage")}
                    type="number"
                    step="0.1"
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="rrRatio" className="text-gray-400">R:R Ratio</Label>
                  <Input
                    {...form.register("rrRatio")}
                    type="text"
                    readOnly
                    className="bg-dark-300 border-dark-400 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-gray-400">Notes</Label>
                <Textarea
                  {...form.register("notes")}
                  placeholder="Additional notes about this trade..."
                  className="bg-dark-300 border-dark-400 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Partial Take Profit */}
          <Card className="bg-dark-200 border-dark-300">
            <CardHeader>
              <CardTitle className="text-white">Partial Take Profit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partialTpEnabled"
                  checked={watchedValues.partialTpEnabled}
                  onCheckedChange={(checked) => form.setValue("partialTpEnabled", checked as boolean)}
                />
                <Label htmlFor="partialTpEnabled" className="text-gray-300">Enable Partial TP</Label>
              </div>
              {watchedValues.partialTpEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partialTpPercentage" className="text-gray-400">% of Position</Label>
                    <Input
                      {...form.register("partialTpPercentage")}
                      type="number"
                      min="1"
                      max="100"
                      className="bg-dark-300 border-dark-400 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partialTpPrice" className="text-gray-400">Price Level</Label>
                    <Input
                      {...form.register("partialTpPrice")}
                      type="number"
                      step="0.01"
                      className="bg-dark-300 border-dark-400 text-white"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation("/")}
          className="border-dark-400 text-gray-300 hover:text-white hover:bg-dark-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-info text-white hover:bg-blue-600"
          disabled={createTrade.isPending || updateTrade.isPending}
        >
          {createTrade.isPending || updateTrade.isPending ? "Saving..." : trade ? "Update Trade" : "Save Trade"}
        </Button>
      </div>
    </form>
  );
}
