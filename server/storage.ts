import { trades, type Trade, type InsertTrade, type UpdateTrade } from "@shared/schema";

export interface IStorage {
  getTrade(id: number): Promise<Trade | undefined>;
  getAllTrades(): Promise<Trade[]>;
  getTradesByFilter(filter: {
    instrument?: string;
    session?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, trade: UpdateTrade): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;
  getTradeStats(): Promise<{
    winRate: number;
    totalPnl: number;
    maxDrawdown: number;
    activeTrades: number;
    totalTrades: number;
  }>;
  getSettings(): Promise<any>;
  updateSettings(settings: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private trades: Map<number, Trade>;
  private currentId: number;
  private settings: any;

  constructor() {
    this.trades = new Map();
    this.currentId = 1;
    this.settings = {
      profile: {
        name: "John Trader",
        email: "john.trader@example.com",
        timezone: "GMT+7",
        accountType: "Premium"
      },
      trading: {
        defaultLotSize: "0.10",
        defaultRiskPercentage: "2.0",
        defaultBias: "bull",
        preferredInstruments: ["XAUUSD", "BTCUSD"]
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        tradingReminders: true,
        newsAlerts: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: "60"
      },
      apiKeys: {
        finnhub: "",
        santiment: "",
        newsApi: ""
      }
    };
    this.seedData();
  }

  private seedData() {
    // Add some sample trades for demonstration
    const sampleTrades: InsertTrade[] = [
      {
        instrument: "XAUUSD",
        session: "london",
        marketBias: "bull",
        biasNotes: "Strong bullish momentum on H4",
        orderType: "market",
        direction: "long",
        entryPrice: "2065.50",
        stopLoss: "2055.00",
        takeProfit: "2080.00",
        exitPrice: "2078.20",
        lotSize: "0.10",
        startBalance: "10000.00",
        currentEquity: "10445.00",
        riskPercentage: "2.0",
        status: "closed",
        exitReason: "TP Hit",
        trendAnalysis: "HH/HL pattern confirmed",
        indicators: "EMA 20/50 bullish crossover",
        partialTpEnabled: false,
        notes: "Clean breakout above resistance",
      },
      {
        instrument: "BTCUSD",
        session: "newyork",
        marketBias: "bear",
        biasNotes: "Bearish divergence on RSI",
        orderType: "market",
        direction: "short",
        entryPrice: "42850.00",
        stopLoss: "43200.00",
        takeProfit: "42000.00",
        exitPrice: "42320.00",
        lotSize: "0.05",
        startBalance: "10445.00",
        currentEquity: "10725.00",
        riskPercentage: "1.5",
        status: "closed",
        exitReason: "TP Hit",
        trendAnalysis: "LH/LL pattern forming",
        indicators: "MACD bearish crossover",
        partialTpEnabled: false,
        notes: "Good risk-reward setup",
      },
      {
        instrument: "ETHUSD",
        session: "asia",
        marketBias: "bull",
        biasNotes: "Testing resistance level",
        orderType: "market",
        direction: "long",
        entryPrice: "3825.00",
        stopLoss: "3780.00",
        takeProfit: "3900.00",
        exitPrice: "3745.00",
        lotSize: "0.20",
        startBalance: "10725.00",
        currentEquity: "10560.00",
        riskPercentage: "2.0",
        status: "closed",
        exitReason: "SL Hit",
        trendAnalysis: "False breakout",
        indicators: "RSI overbought",
        partialTpEnabled: false,
        notes: "Market rejected at resistance",
      },
    ];

    sampleTrades.forEach(trade => {
      this.createTrade(trade);
    });
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values()).sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  }

  async getTradesByFilter(filter: {
    instrument?: string;
    session?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Trade[]> {
    let trades = Array.from(this.trades.values());

    if (filter.instrument && filter.instrument !== "all") {
      trades = trades.filter(trade => trade.instrument === filter.instrument);
    }

    if (filter.session && filter.session !== "all") {
      trades = trades.filter(trade => trade.session === filter.session);
    }

    if (filter.status && filter.status !== "all") {
      trades = trades.filter(trade => trade.status === filter.status);
    }

    if (filter.startDate) {
      trades = trades.filter(trade => 
        new Date(trade.entryDate) >= new Date(filter.startDate!)
      );
    }

    if (filter.endDate) {
      trades = trades.filter(trade => 
        new Date(trade.entryDate) <= new Date(filter.endDate!)
      );
    }

    return trades.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.currentId++;
    const now = new Date();

    // Calculate P&L and other metrics
    const pnl = insertTrade.exitPrice 
      ? (parseFloat(insertTrade.exitPrice) - parseFloat(insertTrade.entryPrice)) * 
        parseFloat(insertTrade.lotSize) * 
        (insertTrade.direction === "long" ? 1 : -1)
      : 0;

    const pnlPercentage = pnl / parseFloat(insertTrade.startBalance) * 100;

    const risk = Math.abs(parseFloat(insertTrade.entryPrice) - parseFloat(insertTrade.stopLoss || "0"));
    const reward = Math.abs(parseFloat(insertTrade.takeProfit || "0") - parseFloat(insertTrade.entryPrice));
    const rrRatio = risk > 0 ? reward / risk : 0;

    const trade: Trade = {
      ...insertTrade,
      id,
      pnl: pnl.toFixed(2),
      pnlPercentage: pnlPercentage.toFixed(2),
      rrRatio: rrRatio.toFixed(2),
      entryDate: now,
      exitDate: insertTrade.exitPrice ? now : null,
      status: insertTrade.status || "open",
      biasNotes: insertTrade.biasNotes || null,
      stopLoss: insertTrade.stopLoss || null,
      takeProfit: insertTrade.takeProfit || null,
      exitPrice: insertTrade.exitPrice || null,
      exitReason: insertTrade.exitReason || null,
      trendAnalysis: insertTrade.trendAnalysis || null,
      indicators: insertTrade.indicators || null,
      partialTpPercentage: insertTrade.partialTpPercentage || null,
      partialTpPrice: insertTrade.partialTpPrice || null,
      notes: insertTrade.notes || null,
      riskPercentage: insertTrade.riskPercentage || null,
      partialTpEnabled: insertTrade.partialTpEnabled || false,
    };

    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: number, updateTrade: UpdateTrade): Promise<Trade | undefined> {
    const existingTrade = this.trades.get(id);
    if (!existingTrade) return undefined;

    const updatedTrade: Trade = {
      ...existingTrade,
      ...updateTrade,
      exitDate: updateTrade.exitPrice ? new Date() : existingTrade.exitDate,
    };

    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async deleteTrade(id: number): Promise<boolean> {
    return this.trades.delete(id);
  }

  async getTradeStats(): Promise<{
    winRate: number;
    totalPnl: number;
    maxDrawdown: number;
    activeTrades: number;
    totalTrades: number;
  }> {
    const trades = Array.from(this.trades.values());
    const closedTrades = trades.filter(trade => trade.status === "closed");
    const winningTrades = closedTrades.filter(trade => parseFloat(trade.pnl || "0") > 0);

    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const totalPnl = closedTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || "0"), 0);
    const activeTrades = trades.filter(trade => trade.status === "open").length;

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let peak = 0;
    let current = 0;

    for (const trade of closedTrades) {
      current += parseFloat(trade.pnl || "0");
      if (current > peak) peak = current;
      const drawdown = (peak - current) / peak * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return {
      winRate: Math.round(winRate * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      activeTrades,
      totalTrades: trades.length,
    };
  }

  async getSettings(): Promise<any> {
    return this.settings;
  }

  async updateSettings(newSettings: any): Promise<any> {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }
}

export const storage = new MemStorage();