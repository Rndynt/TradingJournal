
import { useState, useEffect } from 'react';
import { priceService, type PriceData } from '@/lib/utils/price-service';

const DEFAULT_SYMBOLS = ['XAUUSD', 'BTCUSD', 'ETHUSD'];

export function usePrices(symbols: string[] = DEFAULT_SYMBOLS) {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = priceService.subscribe((updatedPrices) => {
      setPrices(updatedPrices);
      setIsLoading(false);
    });

    priceService.startUpdates(symbols);

    return () => {
      unsubscribe();
      priceService.stopUpdates();
    };
  }, [symbols.join(',')]);

  return {
    prices,
    isLoading,
    getPrice: (symbol: string) => prices.get(symbol),
  };
}

export function usePrice(symbol: string) {
  const { prices, isLoading } = usePrices([symbol]);
  return {
    price: prices.get(symbol),
    isLoading,
  };
}
