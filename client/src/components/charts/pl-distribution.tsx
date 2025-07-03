import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Trade } from "@shared/schema";

interface PlDistributionProps {
  trades: Trade[];
}

export default function PlDistribution({ trades }: PlDistributionProps) {
  const closedTrades = trades.filter(trade => trade.status === "closed");
  
  const ranges = [
    { label: "< -$500", min: -Infinity, max: -500, color: "#EF4444" },
    { label: "-$500 to -$100", min: -500, max: -100, color: "#F87171" },
    { label: "-$100 to $0", min: -100, max: 0, color: "#FCA5A5" },
    { label: "$0 to $100", min: 0, max: 100, color: "#86EFAC" },
    { label: "$100 to $500", min: 100, max: 500, color: "#22C55E" },
    { label: "> $500", min: 500, max: Infinity, color: "#10B981" },
  ];

  const data = ranges.map(range => {
    const count = closedTrades.filter(trade => {
      const pnl = parseFloat(trade.pnl || "0");
      return pnl >= range.min && pnl < range.max;
    }).length;

    return {
      label: range.label,
      count,
      color: range.color,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4D4D4D" />
        <XAxis 
          dataKey="label" 
          tick={{ fill: "#9CA3AF", fontSize: 10 }}
          stroke="#4D4D4D"
          angle={-45}
          textAnchor="end"
          height={80}
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
          formatter={(value: number) => [`${value} trades`, "Count"]}
        />
        <Bar 
          dataKey="count" 
          fill="#10B981"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
