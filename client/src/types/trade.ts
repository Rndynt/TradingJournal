export interface TradeStats {
  winRate: number;
  totalPnl: number;
  maxDrawdown: number;
  activeTrades: number;
  totalTrades: number;
}

export interface TradeFilter {
  instrument?: string;
  session?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
}
