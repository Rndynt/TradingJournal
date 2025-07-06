// client/src/pages/price.tsx

import { useEffect } from "react";
import PriceTicker from "@/components/charts/price-ticker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock } from "lucide-react";
import { priceService } from "@/lib/utils/price-service";

export default function Prices() {
  const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const commodities = ['XAUUSD', 'XAGUSD'];
  const crypto = ['BTCUSD', 'ETHUSD'];
  
  // Start updates sekali saat halaman dimount
  useEffect(() => {
    const allSymbols = [...majorPairs, ...commodities, ...crypto];
    priceService.startUpdates(allSymbols);
    
    return () => {
      priceService.stopUpdates();
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Prices</h2>
          <p className="text-gray-400 mt-1">Real-time pricing for all trading instruments</p>
        </div>
        <Badge variant="secondary" className="bg-info/20 text-info">
          <Clock className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Major Currency Pairs */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-info" />
            <span>Major Currency Pairs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PriceTicker symbols={majorPairs} />
        </CardContent>
      </Card>

      {/* Commodities */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-profit" />
            <span>Precious Metals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PriceTicker symbols={commodities} />
        </CardContent>
      </Card>

      {/* Cryptocurrencies */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-warning" />
            <span>Cryptocurrencies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PriceTicker symbols={crypto} />
        </CardContent>
      </Card>
    </div>
  );
}