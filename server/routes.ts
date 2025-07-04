import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { storage } from "./PgStorage";
import { insertTradeSchema, updateTradeSchema } from "@shared/schema";
import { z } from "zod";

const filterSchema = z.object({
  instrument: z.string().optional(),
  session: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all trades
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.getAllTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  // Get filtered trades
  app.get("/api/trades/filter", async (req, res) => {
    try {
      const filter = filterSchema.parse(req.query);
      const trades = await storage.getTradesByFilter(filter);
      res.json(trades);
    } catch (error) {
      res.status(400).json({ message: "Invalid filter parameters" });
    }
  });

  // Get trade stats
  app.get("/api/trades/stats", async (req, res) => {
    try {
      const stats = await storage.getTradeStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trade stats" });
    }
  });

  // Get single trade
  app.get("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trade = await storage.getTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  // Create new trade
  /**
  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      res.status(201).json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trade" });
    }
  }); **/

  app.post("/api/trades", async (req, res, next) => {
  // 1. Log payload mentah
  console.log("✉️ POST /api/trades incoming body:", req.body);

  let tradeData;
  try {
    tradeData = insertTradeSchema.parse(req.body);
    console.log("🛠️ Parsed tradeData:", tradeData);
  } catch (zErr) {
    console.error("⚠️ Zod validation error:", zErr);
    return res.status(400).json({ message: "Invalid trade data", errors: (zErr as any).errors });
  }

  try {
    // 2. Jalankan insert dan log hasilnya
    const result = await storage.createTrade(tradeData);
    console.log("✅ storage.createTrade result:", result);
    return res.status(201).json(result);
  } catch (e) {
    console.error("❌ Error in storage.createTrade:", e);
    return next(e);
  }
});

  // Update trade
  app.put("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateTradeSchema.parse(req.body);
      const trade = await storage.updateTrade(id, updateData);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update trade" });
    }
  });

  // Delete trade
  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTrade(id);
      if (!success) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trade" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // News endpoints
  app.get("/api/news", async (req, res) => {
    try {
      const events = await storage.getNewsEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news events" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const event = await storage.createNewsEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create news event" });
    }
  });

  app.get("/api/news/notes", async (req, res) => {
    try {
      const notes = await storage.getNewsNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/news/notes", async (req, res) => {
    try {
      const note = await storage.createNewsNote(req.body);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
