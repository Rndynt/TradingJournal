
import { useState, useEffect } from 'react';
import { priceService, type PriceData } from '@/lib/utils/price-service';

export function usePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = priceService.subscribe((updatedPrices) => {
      if (!isMounted) return;
      setPrices(new Map(
        Array.from(updatedPrices.entries()).filter(([symbol]) =>
          symbols.includes(symbol)
        )
      ));
      setIsLoading(false);
    });

    // ❗️Jangan hentikan semua update, cukup tambah simbol baru
    priceService.startUpdates(symbols);

    return () => {
      isMounted = false;
      unsubscribe();
      // ❌ Jangan panggil stopUpdates() di sini!
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