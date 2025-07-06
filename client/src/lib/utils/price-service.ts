
interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: Date;
}


class PriceService {
  private prices: Map < string, PriceData > = new Map();
  private subscribers: Set < (prices: Map < string, PriceData > ) => void > = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private binanceSockets: Map < string, WebSocket > = new Map();
  
  async fetchPrice(symbol: string): Promise < PriceData > {
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
    
    // Untuk simbol selain XAUUSD, kita handle via WebSocket
    return this.prices.get(symbol) ?? {
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      lastUpdate: new Date(),
    };
  }
  
  startUpdates(symbols: string[], intervalMs = 10000) {
    this.stopUpdates();
    symbols.forEach(symbol => {
      if (symbol === 'XAUUSD') {
        // XAU masih pakai polling
        this.updatePrices([symbol]);
        this.updateInterval = setInterval(() => {
          this.updatePrices([symbol]);
        }, intervalMs);
      } else {
        this.startBinanceWebSocket(symbol);
      }
    });
  }
  
  private startBinanceWebSocket(symbol: string) {
    const binanceSymbol = symbol.toLowerCase(); // eg. btcusd → btcusdt
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}t@trade`);
    
    ws.onmessage = (event) => {
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
    };
    
    ws.onerror = (err) => console.error(`[Binance WS Error] ${symbol}`, err);
    ws.onclose = () => console.warn(`[Binance WS Closed] ${symbol}`);
    
    this.binanceSockets.set(symbol, ws);
  }
  
  stopUpdates() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = null;
    
    // Tutup semua WebSocket Binance
    this.binanceSockets.forEach(ws => ws.close());
    this.binanceSockets.clear();
  }
  
  async updatePrices(symbols: string[]) {
    const updates = await Promise.all(symbols.map(symbol => this.fetchPrice(symbol)));
    updates.forEach(priceData => this.prices.set(priceData.symbol, priceData));
    this.notifySubscribers();
  }
  
  subscribe(callback: (prices: Map < string, PriceData > ) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(new Map(this.prices)));
  }
  
  getPrice(symbol: string): PriceData | undefined {
    return this.prices.get(symbol);
  }
  
  getAllPrices(): Map < string, PriceData > {
    return new Map(this.prices);
  }
}

export const priceService = new PriceService();
export type { PriceData };
