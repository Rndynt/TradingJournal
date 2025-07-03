import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useCreateTrade, useUpdateTrade } from "@/hooks/use-trades";
import { useToast } from "@/hooks/use-toast";
import { calculatePnL, calculateRiskReward, formatCurrency } from "@/lib/utils/calculations";
import { detectSession, getSessionLabel } from "@/lib/utils/session-detector";
import { cn } from "@/lib/utils";
import type { Trade, InsertTrade } from "@shared/schema";

interface TradeFormProps {
  trade?: Trade;
  onSuccess?: () => void;
}

const instruments = [
  { value: "XAUUSD", label: "XAUUSD (Gold)" },
  { value: "BTCUSD", label: "BTCUSD (Bitcoin)" },
  { value: "ETHUSD", label: "ETHUSD (Ethereum)" },
];

const sessions = [
  { value: "asia", label: "Asia Session (00:00-09:00 GMT)" },
  { value: "london", label: "London Session (08:00-17:00 GMT)" },
  { value: "new_york", label: "New York Session (13:00-22:00 GMT)" },
];

export default function TradeForm({ trade, onSuccess }: TradeFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();

  const [formData, setFormData] = useState({
    instrument: trade?.instrument || "XAUUSD",
    session: trade?.session || detectSession(),
    direction: trade?.direction || "long",
    marketBias: trade?.marketBias || "bullish",
    orderType: trade?.orderType || "market",
    startBalance: trade?.startBalance || "10000",
    currentEquity: trade?.currentEquity || "10000",
    entryPrice: trade?.entryPrice || "",
    stopLoss: trade?.stopLoss || "",
    takeProfit: trade?.takeProfit || "",
    lotSize: trade?.lotSize || "0.01",
    riskPercentage: trade?.riskPercentage || "2",
    notes: trade?.notes || "",
    trendAnalysis: trade?.trendAnalysis || "",
    partialTpEnabled: trade?.partialTpEnabled || false,
    partialTpPercentage: trade?.partialTpPercentage || "",
    partialTpPrice: trade?.partialTpPrice || "",
    status: trade?.status || "open",
  });

  const [rrRatio, setRrRatio] = useState(trade?.rrRatio || "1:2");

  // Calculate R:R ratio when prices change
  const calculateRR = () => {
    if (formData.entryPrice && formData.stopLoss && formData.takeProfit) {
      const ratio = calculateRiskReward(
        parseFloat(formData.entryPrice),
        parseFloat(formData.stopLoss),
        parseFloat(formData.takeProfit)
      );
      setRrRatio(ratio);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        rrRatio: rrRatio,
      } as InsertTrade;

      if (trade) {
        await updateTrade.mutateAsync({ ...data, id: trade.id });
        toast({
          title: "Trade Updated",
          description: "Trade has been updated successfully",
        });
      } else {
        await createTrade.mutateAsync(data);
        toast({
          title: "Trade Created",
          description: "New trade has been created successfully",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {trade ? "Edit Trade" : "New Trade Entry"}
        </h1>
        <Badge variant="outline" className="text-sm">
          {getSessionLabel(formData.session)}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Instrument & Session */}
            <Card>
              <CardHeader>
                <CardTitle>Instrument & Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instrument">Instrument</Label>
                    <Select
                      onValueChange={(value) => setFormData({...formData, instrument: value})}
                      defaultValue={formData.instrument}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select instrument" />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((instrument) => (
                          <SelectItem key={instrument.value} value={instrument.value}>
                            {instrument.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="session">Session</Label>
                    <Select
                      onValueChange={(value) => setFormData({...formData, session: value})}
                      defaultValue={formData.session}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Detected session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.value} value={session.value}>
                            {session.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance & Market Bias */}
            <Card>
              <CardHeader>
                <CardTitle>Balance & Market Bias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startBalance">Start Balance</Label>
                    <Input
                      {...form.register("startBalance")}
                      type="number"
                      step="0.01"
                      placeholder="10000.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentEquity">Current Equity</Label>
                    <Input
                      {...form.register("currentEquity")}
                      type="number"
                      step="0.01"
                      placeholder="10000.00"
                    />
                  </div>
                </div>
                <div>
                  <Label>Market Bias</Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue("marketBias", value)}
                    defaultValue={watchedValues.marketBias}
                    className="flex space-x-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bullish" id="bullish" />
                      <Label htmlFor="bullish" className="text-green-500">Bull</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bearish" id="bearish" />
                      <Label htmlFor="bearish" className="text-red-500">Bear</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sideways" id="sideways" />
                      <Label htmlFor="sideways" className="text-blue-500">Sideways</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Technical Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="trendAnalysis">Trend Analysis</Label>
                  <Textarea
                    {...form.register("trendAnalysis")}
                    placeholder="HH/HL pattern, price action notes..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Trade Setup */}
            <Card>
              <CardHeader>
                <CardTitle>Trade Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Direction</Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue("direction", value)}
                    defaultValue={watchedValues.direction}
                    className="flex space-x-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="long" />
                      <Label htmlFor="long" className="text-green-500">Long</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short" className="text-red-500">Short</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      {...form.register("entryPrice")}
                      type="number"
                      step="0.01"
                      placeholder="2650.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lotSize">Lot Size</Label>
                    <Input
                      {...form.register("lotSize")}
                      type="number"
                      step="0.01"
                      placeholder="0.01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      {...form.register("stopLoss")}
                      type="number"
                      step="0.01"
                      placeholder="2640.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    <Input
                      {...form.register("takeProfit")}
                      type="number"
                      step="0.01"
                      placeholder="2680.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskPercentage">Risk %</Label>
                    <Input
                      {...form.register("riskPercentage")}
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rrRatio">R:R Ratio</Label>
                    <Input
                      {...form.register("rrRatio")}
                      type="text"
                      readOnly
                      value={watchedValues.rrRatio}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    {...form.register("notes")}
                    placeholder="Additional notes about this trade..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Partial Take Profit */}
            <Card>
              <CardHeader>
                <CardTitle>Partial Take Profit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="partialTpEnabled"
                    checked={watchedValues.partialTpEnabled}
                    onCheckedChange={(checked) => form.setValue("partialTpEnabled", checked as boolean)}
                  />
                  <Label htmlFor="partialTpEnabled">Enable Partial TP</Label>
                </div>
                {watchedValues.partialTpEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partialTpPercentage">% of Position</Label>
                      <Input
                        {...form.register("partialTpPercentage")}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partialTpPrice">Price Level</Label>
                      <Input
                        {...form.register("partialTpPrice")}
                        type="number"
                        step="0.01"
                        placeholder="2665.00"
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
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createTrade.isPending || updateTrade.isPending}
          >
            {createTrade.isPending || updateTrade.isPending ? "Saving..." : trade ? "Update Trade" : "Save Trade"}
          </Button>
        </div>
      </form>
    </div>
  );
}