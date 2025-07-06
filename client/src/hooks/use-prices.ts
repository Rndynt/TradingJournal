
// client/src/hooks/use-price.tsx

import { useState, useEffect } from 'react';
import { priceService, type PriceData } from '@/lib/utils/price-service';

export function usePrices(symbols: string[] = []) {
  const [prices, setPrices] = useState < Map < string, PriceData >> (new Map());
  
  useEffect(() => {
    const unsubscribe = priceService.subscribe(setPrices);
    return () => unsubscribe();
  }, []);
  
  const filteredPrices = new Map(
    Array.from(prices.entries()).filter(([symbol]) =>
      symbols.length === 0 || symbols.includes(symbol)
    )
  );
  
  return {
    prices: filteredPrices,
    getPrice: (symbol: string) => filteredPrices.get(symbol),
  };
}

export function usePrice(symbol: string) {
  const { prices } = usePrices([symbol]);
  return {
    price: prices.get(symbol),
  };
}