// server/storage.ts

import { createClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import {
  trades,
  type Trade,
  type InsertTrade,
  type UpdateTrade,
} from "@shared/schema";

// 1. Inisiasi client Neon Serverless (HTTP-based, pure JS)
const client = createClient({
  connectionString: process.env.NETLIFY_DATABASE_URL as string,
});

// 2. Hook Drizzle ORM di atas client tersebut
export const db = drizzle(client);

// 3. Storage class yang menggunakan Drizzle–Neon
export class PgStorage {
  /** Ambil satu trade berdasarkan ID */
  async getTrade(id: number): Promise<Trade | undefined> {
    return db
      .select()
      .from(trades)
      .where(trades.id.eq(id))
      .get();
  }

  /** Ambil semua trade, newest first */
  async getAllTrades(): Promise<Trade[]> {
    return db
      .select()
      .from(trades)
      .orderBy(trades.entryDate, "desc")
      .all();
  }

  /** Ambil trades berdasarkan filter */
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

  /** Buat trade baru, override entryDate dengan sekarang */
  async createTrade(data: InsertTrade): Promise<Trade> {
    const [inserted] = await db
      .insert(trades)
      .values({ ...data, entryDate: new Date() })
      .returning()
      .all();
    return inserted;
  }

  /** Update trade berdasarkan ID */
  async updateTrade(
    id: number,
    updateData: UpdateTrade
  ): Promise<Trade | undefined> {
    const [updated] = await db
      .update(trades)
      .set(updateData)
      .where(trades.id.eq(id))
      .returning()
      .all();
    return updated;
  }

  /** Hapus trade berdasarkan ID */
  async deleteTrade(id: number): Promise<boolean> {
    const result = await db.delete(trades).where(trades.id.eq(id)).run();
    return result.rowCount > 0;
  }

  /** Statistik trade sederhana */
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

    const winRate = closed.length
      ? (wins.length / closed.length) * 100
      : 0;

    const totalPnl = closed.reduce(
      (sum, t) => sum + parseFloat(t.pnl ?? "0"),
      0
    );

    // Hitung max drawdown (simple)
    let peak = 0;
    let current = 0;
    let maxDD = 0;
    for (const t of closed) {
      current += parseFloat(t.pnl ?? "0");
      peak = Math.max(peak, current);
      maxDD = Math.max(maxDD, peak - current);
    }
    const maxDrawdown = peak > 0 ? (maxDD / peak) * 100 : 0;

    const activeTrades = all.filter((t) => t.status === "open").length;
    const totalTrades = all.length;

    return {
      winRate: Math.round(winRate * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      activeTrades,
      totalTrades,
    };
  }
}

// 4. Export satu instance
export const storage = new PgStorage();
