// server/storage.ts

import { neon } from "@neondatabase/serverless";
//import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle } from 'drizzle-orm/neon-http';
//import { asc, desc } from 'drizzle-orm';
import { eq, gte, lte } from "drizzle-orm";
//import dayjs from "dayjs";


// Helper types & interfaces
type Filter = {
  instrument?: string;
  session?: string;
  status?: string;
  startDate?: string; // DD/MM/YYYY
  endDate?: string;   // DD/MM/YYYY
};



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
  /**
  async getTradesByFilter(filter: Filter): Promise<Trade[]> {
    console.log("[getTradesByFilter] filter:", filter);
    let q = db.select().from(trades);

    if (filter.instrument && filter.instrument.toLowerCase() !== 'all') {
      q = q.where(eq(trades.instrument, filter.instrument));
    }
    if (filter.session && filter.session.toLowerCase() !== 'all') {
      q = q.where(eq(trades.session, filter.session));
    }
    if (filter.status && filter.status.toLowerCase() !== 'all') {
      q = q.where(eq(trades.status, filter.status));
    }

    const parseDMY = (d: string) => {
      const [day, month, year] = d.split('/');
      return dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD').toDate();
    };

    if (filter.startDate) {
      const parsed = parseDMY(filter.startDate);
      if (!isNaN(parsed.getTime())) {
        q = q.where(gte(trades.entryDate, parsed));
      } else {
        console.warn("Invalid startDate:", filter.startDate);
      }
    }

    if (filter.endDate) {
      const parsed = parseDMY(filter.endDate);
      if (!isNaN(parsed.getTime())) {
        const endOfDay = dayjs(parsed).endOf('day').toDate();
        q = q.where(lte(trades.entryDate, endOfDay));
      } else {
        console.warn("Invalid endDate:", filter.endDate);
      }
    }

    console.log("[getTradesByFilter] executing...");
    const rows = await q.all();
    console.log("[getTradesByFilter] count:", rows.length);
    return rows;
  }**/

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

  async getTradesByFilter(filter: {
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
