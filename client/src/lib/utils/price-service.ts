
interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: Date;
}

class PriceService {
  private prices: Map<string, PriceData> = new Map();
  private subscribers: Set<(prices: Map<string, PriceData>) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  // Mock price data for demonstration - replace with real API calls
  private async fetchPrice(symbol: string): Promise<PriceData> {
    // Simulate price fetching with realistic price movements
    const basePrices: Record<string, number> = {
      'XAUUSD': 2050.00,
      'BTCUSD': 43000.00,
      'ETHUSD': 2600.00,
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 148.50,
      'AUDUSD': 0.6720,
      'USDCAD': 1.3450,
    };

    const basePrice = basePrices[symbol] || 1.0000;
    const randomChange = (Math.random() - 0.5) * 0.02; // ±1% random movement
    const currentPrice = basePrice * (1 + randomChange);
    const change = currentPrice - basePrice;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
      lastUpdate: new Date(),
    };
  }

  async updatePrices(symbols: string[]) {
    const updates = await Promise.all(symbols.map(symbol => this.fetchPrice(symbol)));
    
    updates.forEach(priceData => {
      this.prices.set(priceData.symbol, priceData);
    });

    this.notifySubscribers();
  }

  subscribe(callback: (prices: Map<string, PriceData>) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(new Map(this.prices)));
  }

  startUpdates(symbols: string[], intervalMs: number = 5000) {
    this.stopUpdates();
    this.updatePrices(symbols);
    this.updateInterval = setInterval(() => {
      this.updatePrices(symbols);
    }, intervalMs);
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  getPrice(symbol: string): PriceData | undefined {
    return this.prices.get(symbol);
  }

  getAllPrices(): Map<string, PriceData> {
    return new Map(this.prices);
  }
}

export const priceService = new PriceService();
export type { PriceData };
