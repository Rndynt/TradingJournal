import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCreateTrade, useUpdateTrade } from "@/hooks/use-trades";
import { useToast } from "@/hooks/use-toast";
import { calculateRiskReward } from "@/lib/utils/calculations";
import { detectSession, getSessionLabel } from "@/lib/utils/session-detector";
import type { Trade } from "@shared/schema";

interface TradeFormProps {
  trade?: Trade;
  onSuccess?: () => void;
}

export default function SimpleTradeForm({ trade, onSuccess }: TradeFormProps) {
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

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateRR = () => {
    if (formData.entryPrice && formData.stopLoss && formData.takeProfit) {
      return calculateRiskReward(
        parseFloat(formData.entryPrice),
        parseFloat(formData.stopLoss),
        parseFloat(formData.takeProfit)
      );
    }
    return "1:2";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        rrRatio: calculateRR().toString(),
      };

      if (trade) {
        await updateTrade.mutateAsync({ ...data, id: trade.id });
        toast({
          title: "Trade Updated",
          description: "Trade berhasil diperbarui",
        });
      } else {
        await createTrade.mutateAsync(data);
        toast({
          title: "Trade Created", 
          description: "Trade baru berhasil dibuat",
        });
      }
      onSuccess?.();
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan trade. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {trade ? "Edit Trade" : "Entry Trade Baru"}
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
                      onValueChange={(value) => updateField("instrument", value)}
                      defaultValue={formData.instrument}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XAUUSD">XAUUSD</SelectItem>
                        <SelectItem value="BTCUSD">BTCUSD</SelectItem>
                        <SelectItem value="ETHUSD">ETHUSD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="session">Session</Label>
                    <Select
                      onValueChange={(value) => updateField("session", value)}
                      defaultValue={formData.session}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia">New York</SelectItem>
                        <SelectItem value="london">London</SelectItem>
                        <SelectItem value="new_york">Asia</SelectItem>
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
                      value={formData.startBalance}
                      onChange={(e) => updateField("startBalance", e.target.value)}
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentEquity">Current Equity</Label>
                    <Input
                      value={formData.currentEquity}
                      onChange={(e) => updateField("currentEquity", e.target.value)}
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <Label>Market Bias</Label>
                  <div className="flex space-x-6 mt-2">
                    <button
                      type="button"
                      onClick={() => updateField("marketBias", "bullish")}
                      className={`px-4 py-2 rounded ${formData.marketBias === "bullish" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      Bull
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("marketBias", "bearish")}
                      className={`px-4 py-2 rounded ${formData.marketBias === "bearish" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      Bear
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("marketBias", "sideways")}
                      className={`px-4 py-2 rounded ${formData.marketBias === "sideways" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      Sideways
                    </button>
                  </div>
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
                    value={formData.trendAnalysis}
                    onChange={(e) => updateField("trendAnalysis", e.target.value)}
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
                  <div className="flex space-x-6 mt-2">
                    <button
                      type="button"
                      onClick={() => updateField("direction", "long")}
                      className={`px-4 py-2 rounded ${formData.direction === "long" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      Long
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("direction", "short")}
                      className={`px-4 py-2 rounded ${formData.direction === "short" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      Short
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      value={formData.entryPrice}
                      onChange={(e) => updateField("entryPrice", e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="2650.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lotSize">Lot Size</Label>
                    <Input
                      value={formData.lotSize}
                      onChange={(e) => updateField("lotSize", e.target.value)}
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
                      value={formData.stopLoss}
                      onChange={(e) => updateField("stopLoss", e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="2640.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    <Input
                      value={formData.takeProfit}
                      onChange={(e) => updateField("takeProfit", e.target.value)}
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
                      value={formData.riskPercentage}
                      onChange={(e) => updateField("riskPercentage", e.target.value)}
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rrRatio">R:R Ratio</Label>
                    <Input
                      value={calculateRR()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Catatan tambahan tentang trade ini..."
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
                    checked={formData.partialTpEnabled}
                    onCheckedChange={(checked) => updateField("partialTpEnabled", checked as boolean)}
                  />
                  <Label htmlFor="partialTpEnabled">Enable Partial TP</Label>
                </div>
                {formData.partialTpEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partialTpPercentage">% of Position</Label>
                      <Input
                        value={formData.partialTpPercentage}
                        onChange={(e) => updateField("partialTpPercentage", e.target.value)}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partialTpPrice">Price Level</Label>
                      <Input
                        value={formData.partialTpPrice}
                        onChange={(e) => updateField("partialTpPrice", e.target.value)}
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
            {createTrade.isPending || updateTrade.isPending ? "Menyimpan..." : trade ? "Update Trade" : "Simpan Trade"}
          </Button>
        </div>
      </form>
    </div>
  );
}