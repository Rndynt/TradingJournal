// server/storage.ts

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/neon-serverless";
import {
  trades,
  type Trade,
  type InsertTrade,
  type UpdateTrade,
} from "@shared/schema";

// 1. Inisiasi koneksi ke Neon via Pool + Drizzle
const connectionString =
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
  process.env.NETLIFY_DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Env var NETLIFY_DATABASE_URL_UNPOOLED atau NETLIFY_DATABASE_URL wajib diset"
  );
}
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool);

export class PgStorage {
  /** Ambil satu trade berdasarkan ID */
  async getTrade(id: number): Promise<Trade | undefined> {
    return db
      .select()
      .from(trades)
      .where(trades.id.eq(id))
      .get();
  }

  /** Ambil semua trade, urut newest first */
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

  /** Buat trade baru, meng‐override entryDate dengan sekarang */
  async createTrade(data: InsertTrade): Promise<Trade> {
    const [inserted] = await db
      .insert(trades)
      .values({
        ...data,
        // entryDate default di DB .defaultNow(), tapi kita override agar konsisten
        entryDate: new Date(),
      })
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
      .set({
        ...updateData,
        // kalau exitDate diset (partial), biar konsisten:
        exitDate:
          updateData.exitDate !== undefined
            ? updateData.exitDate
            : undefined,
      })
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
      const dd = peak - current;
      maxDD = Math.max(maxDD, dd);
    }
    const maxDrawdown =
      peak > 0 ? (maxDD / peak) * 100 : 0;

    const activeTrades = all.filter((t) => t.status === "open")
      .length;
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

// Export satu instance
export const storage = new PgStorage();
