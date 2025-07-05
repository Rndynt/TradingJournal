// server/storage.ts

import { neon } from "@neondatabase/serverless";
//import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle } from 'drizzle-orm/neon-http';

import {
  trades,
  type Trade,
  type InsertTrade,
  type UpdateTrade,
} from "@shared/schema";

const url =
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ??
  process.env.NETLIFY_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Env var `NETLIFY_DATABASE_URL_UNPOOLED`, `NETLIFY_DATABASE_URL` atau `DATABASE_URL` harus diset"
  );
}
const sql = neon(url);
const db = drizzle({ client: sql });

export class PgStorage {
  async getTrade(id: number): Promise<Trade | undefined> {
    return db.select().from(trades).where(trades.id.eq(id)).get();
  }

  async getAllTrades(): Promise<Trade[]> {
    return db.select().from(trades).orderBy(trades.entryDate, "desc").all();
  }

  async getTradesByFilter(filter: {
    instrument?: string;
    session?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Trade[]> {
    let q = db.select().from(trades);
    if (filter.instrument && filter.instrument !== "all") {
      q = q.where(trades.instrument.eq(filter.instrument));
    }
    if (filter.session && filter.session !== "all") {
      q = q.where(trades.session.eq(filter.session));
    }
    if (filter.status && filter.status !== "all") {
      q = q.where(trades.status.eq(filter.status));
    }
    if (filter.startDate) {
      q = q.where(trades.entryDate.gte(new Date(filter.startDate)));
    }
    if (filter.endDate) {
      q = q.where(trades.entryDate.lte(new Date(filter.endDate)));
    }
    return q.orderBy(trades.entryDate, "desc").all();
  }

  async createTrade(data: InsertTrade): Promise<Trade> {
    // tanpa .all(), .run(), atau .execute()
      const now = new Date();

    // 1. Sanitasi: ubah setiap empty string jadi undefined
    const sanitized = Object.fromEntries(
      Object.entries(data).map(([key, val]) =>
        val === "" ? [key, undefined] : [key, val]
      )
    ) as Partial<InsertTrade>;

    // 2. Payload final: tambahkan entryDate
    const payload = {
      ...sanitized,
      entryDate: now,
    };
    
    const [inserted] = await db
      .insert(trades)
      .values({ ...data, entryDate: new Date() })
      .returning();
    return inserted;
  }

  async updateTrade(
    id: number,
    updateData: UpdateTrade
  ): Promise<Trade | undefined> {
    const [updated] = await db
      .update(trades)
      .set(updateData)
      .where(trades.id.eq(id))
      .returning();
    return updated;
  }

  async deleteTrade(id: number): Promise<boolean> {
    const result = await db.delete(trades).where(trades.id.eq(id)).run();
    return result.rowCount > 0;
  }

  async getTradeStats(): Promise<{
    winRate: number;
    totalPnl: number;
    maxDrawdown: number;
    activeTrades: number;
    totalTrades: number;
  }> {
    const all = await this.getAllTrades();
    const closed = all.filter((t) => t.status === "closed");
    const wins = closed.filter((t) => parseFloat(t.pnl ?? "0") > 0);
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
    const totalPnl = closed.reduce((sum, t) => sum + parseFloat(t.pnl ?? "0"), 0);
    let peak = 0,
      current = 0,
      maxDD = 0;
    for (const t of closed) {
      current += parseFloat(t.pnl ?? "0");
      peak = Math.max(peak, current);
      maxDD = Math.max(maxDD, peak - current);
    }
    const maxDrawdown = peak > 0 ? (maxDD / peak) * 100 : 0;
    const activeTrades = all.filter((t) => t.status === "open").length;
    return {
      winRate: Math.round(winRate * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      activeTrades,
      totalTrades: all.length,
    };
  }
}

export const storage = new PgStorage();
