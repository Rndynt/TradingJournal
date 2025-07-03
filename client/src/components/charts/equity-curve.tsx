import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Trade } from "@shared/schema";

interface EquityCurveProps {
  trades: Trade[];
}

export default function EquityCurve({ trades }: EquityCurveProps) {
  const data = trades
    .filter(trade => trade.status === "closed")
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .reduce((acc, trade, index) => {
      const prevEquity = index > 0 ? acc[index - 1].equity : 10000;
      const currentEquity = prevEquity + parseFloat(trade.pnl || "0");
      
      acc.push({
        date: new Date(trade.entryDate).toLocaleDateString(),
        equity: currentEquity,
        pnl: parseFloat(trade.pnl || "0"),
      });
      
      return acc;
    }, [] as Array<{ date: string; equity: number; pnl: number }>);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4D4D4D" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          stroke="#4D4D4D"
        />
        <YAxis 
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          stroke="#4D4D4D"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#2D2D2D", 
            border: "1px solid #4D4D4D",
            borderRadius: "8px",
            color: "#FFFFFF"
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
        />
        <Line 
          type="monotone" 
          dataKey="equity" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: "#10B981" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
