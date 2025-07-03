import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  instrument: text("instrument").notNull(),
  session: text("session").notNull(),
  marketBias: text("market_bias").notNull(),
  biasNotes: text("bias_notes"),
  orderType: text("order_type").notNull(),
  direction: text("direction").notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }),
  takeProfit: decimal("take_profit", { precision: 10, scale: 2 }),
  exitPrice: decimal("exit_price", { precision: 10, scale: 2 }),
  lotSize: decimal("lot_size", { precision: 10, scale: 4 }).notNull(),
  startBalance: decimal("start_balance", { precision: 10, scale: 2 }).notNull(),
  currentEquity: decimal("current_equity", { precision: 10, scale: 2 }).notNull(),
  pnl: decimal("pnl", { precision: 10, scale: 2 }),
  pnlPercentage: decimal("pnl_percentage", { precision: 5, scale: 2 }),
  riskPercentage: decimal("risk_percentage", { precision: 5, scale: 2 }),
  rrRatio: decimal("rr_ratio", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("open"),
  exitReason: text("exit_reason"),
  trendAnalysis: text("trend_analysis"),
  indicators: text("indicators"),
  partialTpEnabled: boolean("partial_tp_enabled").default(false),
  partialTpPercentage: decimal("partial_tp_percentage", { precision: 5, scale: 2 }),
  partialTpPrice: decimal("partial_tp_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  exitDate: timestamp("exit_date"),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  entryDate: true,
  exitDate: true,
  pnl: true,
  pnlPercentage: true,
  rrRatio: true,
});

export const updateTradeSchema = createInsertSchema(trades).omit({
  id: true,
  entryDate: true,
}).partial();

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type UpdateTrade = z.infer<typeof updateTradeSchema>;
export type Trade = typeof trades.$inferSelect;
