// netlify/functions/api.ts
import express, { type Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ––– Tambahkan middleware debug –––
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("🔍 Incoming Request:", {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    dbUrl: process.env.NETLIFY_DATABASE_URL_UNPOOLED ?? process.env.NETLIFY_DATABASE_URL,
  });
  next();
});
// ––– End middleware debug ––-

// Daftarkan hanya route /api
registerRoutes(app);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

export const handler = serverless(app);
