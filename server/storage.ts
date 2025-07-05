// server/storage.ts

import { neon } from "@neondatabase/serverless";
//import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle } from 'drizzle-orm/neon-http';
//import { asc, desc } from 'drizzle-orm';
import { eq, gte, lte } from "drizzle-orm";
import {
  trades,
  type Trade as SchemaTrade,
  type InsertTrade,
  type UpdateTrade,
} from "@shared/schema";

// Helper types & interfaces
type Filter = {
  instrument?: string;
  session?: string;
  status?: string;
  startDate?: string; // DD/MM/YYYY
  endDate?: string;   // DD/MM/YYYY
};

type Trade = SchemaTrade;

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

  async getAllTradesOld(): Promise<Trade[]> {
    return db.select().from(trades).orderBy(trades.entryDate, "desc").all();
  }

  async getAllTrades(): Promise<Trade[]> {
      const data = await db.select().from(trades);
      return data;
  }

  /**
   * Ambil trades berdasarkan filter: instrument, session, status, dan rentang tanggal
   */

  async getTradesByFilter(filter: Filter): Promise<Trade[]> {
    console.log("[getTradesByFilter] filter:", filter);
    let q = db.select().from(trades);

    // instrument, session, status filters
    if (filter.instrument && filter.instrument.toLowerCase() !== 'all') {
      q = q.where(eq(trades.instrument, filter.instrument));
    }
    if (filter.session && filter.session.toLowerCase() !== 'all') {
      q = q.where(eq(trades.session, filter.session));
    }
    if (filter.status && filter.status.toLowerCase() !== 'all') {
      q = q.where(eq(trades.status, filter.status));
    }

    // Parse date string, return Date or null
    const parseDate = (d: string): Date | null => {
      let utcMs: number;
      if (d.includes('/')) {
        // DD/MM/YYYY
        const [day, month, year] = d.split('/').map(Number);
        utcMs = Date.UTC(year, month - 1, day);
      } else {
        // assume ISO YYYY-MM-DD
        utcMs = Date.parse(d);
      }
      return isNaN(utcMs) ? null : new Date(utcMs);
    };

    // Apply startDate filter
    if (filter.startDate) {
      const start = parseDate(filter.startDate);
      if (start) {
        // start at 00:00:00 UTC
        start.setUTCHours(0, 0, 0, 0);
        console.log('[getTradesByFilter] startDate >=', start.toISOString());
        q = q.where(gte(trades.entryDate, start));
      }
    }

    // Apply endDate filter
    if (filter.endDate) {
      const end = parseDate(filter.endDate);
      if (end) {
        // end at 23:59:59 UTC
        end.setUTCHours(23, 59, 59, 999);
        console.log('[getTradesByFilter] endDate <=', end.toISOString());
        q = q.where(lte(trades.entryDate, end));
      }
    }

    // Log final SQL
    console.log('[getTradesByFilter] SQL:', q.toSQL());
    const rows = await q;
    console.log('[getTradesByFilter] count:', rows.length);
    return rows;
  }

  async getTradesByFilterOld3(filter: Filter): Promise<Trade[]> {
    let q = db.select().from(trades);

    // instrument, session, status filters
    if (filter.instrument?.toLowerCase() !== 'all' && filter.instrument) {
      q = q.where(eq(trades.instrument, filter.instrument));
    }
    if (filter.session?.toLowerCase() !== 'all' && filter.session) {
      q = q.where(eq(trades.session, filter.session));
    }
    if (filter.status?.toLowerCase() !== 'all' && filter.status) {
      q = q.where(eq(trades.status, filter.status));
    }

    const sql = q.toSQL();
    console.log("[getAllTradesSQL] SQL:", sql);

    // Parse date string, return Date or null
    const parseDate = (d: string): Date | null => {
      const dt = Date.parse(d.includes('/') ? d.split('/').reverse().join('-') : d);
      return isNaN(dt) ? null : new Date(dt);
    };

    // startDate filter
    if (filter.startDate) {
      const start = parseDate(filter.startDate);
      if (start) {
        q = q.where(gte(trades.entryDate, start));
      }
    }

    // endDate filter
    if (filter.endDate) {
      const end = parseDate(filter.endDate);
      if (end) {
        end.setHours(23, 59, 59, 999);
        q = q.where(lte(trades.entryDate, end));
      }
    }

    const sql1 = q.toSQL();
    console.log("[getAllTradesSQL2] SQL:", sql1);

    return await q;
  }


  async getTradesByFilterOld(filter: {
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

  async getTradesByFilterOld2(filter: {
    instrument?: string;
    session?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Trade[]> {
    // 1. Log filter yang diterima
    console.log("[getTradesByFilter] filter:", filter);

    // 2. Siapkan query builder
    let q = await db.select().from(trades);

    if (filter.instrument && filter.instrument !== "all") {
      //q = q.where(trades.instrument.eq(filter.instrument));
      q = q.where(eq(trades.instrument, filter.instrument));
    }
    if (filter.session && filter.session !== "all") {
     // q = q.where(trades.session.eq(filter.session));
      q = q.where(eq(trades.session, filter.session));
    }
    if (filter.status && filter.status !== "all") {
      //q = q.where(trades.status.eq(filter.status));
      q = q.where(eq(trades.status, filter.status));
    }

    const sql = q.toSQL();
    console.log("[getAllTradesSQL] SQL:", sql);

    console.log("--------------filter startdate---------------");

    if (filter.startDate) {
      const d = new Date(filter.startDate);
      if (!isNaN(d.getTime())) {
        //q = q.where(trades.entryDate.gte(d));
        q = q.where(gte(trades.entryDate, d));
      } else {
        console.log(`[getTradesByFilter] invalid startDate: ${filter.startDate}`);
      }
    }

    console.log("-------------filter enddate----------------");

    if (filter.endDate) {
      const d = new Date(filter.endDate);
      if (!isNaN(d.getTime())) {
       // q = q.where(trades.entryDate.lte(d));
        q = q.where(lte(trades.entryDate, d));
      } else {
        console.log(`[getTradesByFilter] invalid endDate: ${filter.endDate}`);
      }
    }

    console.log("--------------return data---------------");
    
    return q;
  }


  async createTrade(data: InsertTrade): Promise<Trade> {
    // tanpa .all(), .run(), atau .execute()
     // const now = new Date();

    // 1. Sanitasi: ubah setiap empty string jadi undefined
    const sanitized = Object.fromEntries(
      Object.entries(data).map(([key, val]) =>
        val === "" ? [key, undefined] : [key, val]
      )
    ) as Partial<InsertTrade>;

    // 2. Payload final: tambahkan entryDate
    const payload = {
      ...sanitized,
      entryDate: new Date(),
    };
    
    const [inserted] = await db
      .insert(trades)
      .values(payload)
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

  async getTradeStatsOld(): Promise<{
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

  async getTradeStats(): Promise<{
  winRate: number;
  totalPnl: number;
  maxDrawdown: number;
  activeTrades: number;
  totalTrades: number;
}> {
  const all = await this.getAllTrades();

  // 1. Hitung realized & unrealized PnL per trade
  const pnls = all.map((t) => {
    if (t.status === "closed" && t.pnl !== null) {
      return parseFloat(t.pnl);
    }
    // open trade: unrealized PnL = currentEquity - startBalance
    return parseFloat(t.currentEquity) - parseFloat(t.startBalance);
  });

  // 2. Statistik closed trades untuk winRate
  const closed = all.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => parseFloat(t.pnl ?? "0") > 0);
  const winRate = closed.length
    ? (wins.length / closed.length) * 100
    : 0;

  // 3. Total PnL dari semua trade (real + unreal)
  const totalPnl = pnls.reduce((sum, x) => sum + x, 0);

  // 4. Max drawdown di sepanjang cumulative PnL
  let peak = 0,
    current = 0,
    maxDD = 0;
  for (const x of pnls) {
    current += x;
    peak = Math.max(peak, current);
    maxDD = Math.max(maxDD, peak - current);
  }
  const maxDrawdown = peak > 0 ? (maxDD / peak) * 100 : 0;

  // 5. Active & total trades
  const activeTrades = all.filter((t) => t.status === "open").length;
  const totalTrades = all.length;

  return {
    winRate:      Math.round(winRate      * 100) / 100,
    totalPnl:     Math.round(totalPnl     * 100) / 100,
    maxDrawdown:  Math.round(maxDrawdown  * 100) / 100,
    activeTrades,
    totalTrades,
  };
}
}

export const storage = new PgStorage();
