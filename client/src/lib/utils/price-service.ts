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
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private binanceSockets: Map<string, WebSocket> = new Map();

  async fetchPrice(symbol: string): Promise<PriceData> {
    try {
      if (symbol === 'XAUUSD') {
        const res = await fetch('https://api.gold-api.com/price/XAU');
        const data = await res.json();
        const currentPrice = data.price;
        const previous = this.prices.get(symbol)?.price ?? currentPrice;
        const change = currentPrice - previous;
        const changePercent = (change / previous) * 100;

        return {
          symbol,
          price: currentPrice,
          change,
          changePercent,
          lastUpdate: new Date(data.updatedAt),
        };
      }

      // Untuk simbol selain XAUUSD
      return this.prices.get(symbol) ?? {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        lastUpdate: new Date(),
      };
    } catch (err) {
      console.error(`[Fetch Error] ${symbol}`, err);
      return {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        lastUpdate: new Date(),
      };
    }
  }

  startUpdates(symbols: string[], intervalMs = 10000) {
    this.stopUpdates();

    symbols.forEach((symbol) => {
      if (symbol === 'XAUUSD') {
        this.fetchPrice(symbol).then((priceData) => {
          this.prices.set(symbol, priceData);
          this.notifySubscribers();
        });

        const interval = setInterval(async () => {
          const priceData = await this.fetchPrice(symbol);
          this.prices.set(symbol, priceData);
          this.notifySubscribers();
        }, intervalMs);

        this.pollingIntervals.set(symbol, interval);
      } else {
        this.startBinanceWebSocket(symbol);
      }
    });
  }

  private startBinanceWebSocket(symbol: string) {
    const base = symbol.replace('USD', '').toLowerCase();
    const binanceSymbol = `${base}usdt`;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const currentPrice = parseFloat(data.p);
        const prev = this.prices.get(symbol)?.price ?? currentPrice;
        const change = currentPrice - prev;
        const changePercent = (change / prev) * 100;

        this.prices.set(symbol, {
          symbol,
          price: currentPrice,
          change,
          changePercent,
          lastUpdate: new Date(),
        });

        this.notifySubscribers();
      } catch (err) {
        console.error(`[WS Parse Error] ${symbol}`, err);
      }
    };

    ws.onerror = (err) => {
      console.error(`[Binance WS Error] ${symbol}`, err);
    };

    ws.onclose = () => {
      console.warn(`[Binance WS Closed] ${symbol}`);
    };

    this.binanceSockets.set(symbol, ws);
  }

  stopUpdates() {
    // Clear polling intervals
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();

    // Close Binance WebSockets
    this.binanceSockets.forEach((ws) => ws.close());
    this.binanceSockets.clear();
  }

  subscribe(callback: (prices: Map<string, PriceData>) => void) {
    this.subscribers.add(callback);
    callback(new Map(this.prices)); // kirim data awal
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    const snapshot = new Map(this.prices); // clone agar aman
    this.subscribers.forEach((cb) => cb(snapshot));
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