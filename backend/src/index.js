import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { searchStops, getDepartures } from "./sl.js";
import { getCached, setCached } from "./cache.js";

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "ok" });
  } catch {
    res.json({ ok: true, database: "unavailable" });
  }
});

app.get("/stops", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Query must be at least 2 characters" });
    }

    const cacheKey = `stops:${q.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const stops = await searchStops(q);
    setCached(cacheKey, stops);
    res.json(stops);
  } catch (error) {
    res.status(502).json({ error: "Could not load stops right now" });
  }
});

app.get("/departures/:stopId", async (req, res) => {
  try {
    const { stopId } = req.params;
    const cacheKey = `departures:${stopId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const result = await getDepartures(stopId);
    setCached(cacheKey, result);
    res.json(result);
  } catch (error) {
    res.status(502).json({ error: "Could not load departures right now" });
  }
});

app.post("/favorites", async (req, res) => {
  try {
    const { userId, stopId, stopName } = req.body || {};
    if (!userId || !stopId) {
      return res.status(400).json({ error: "userId and stopId are required" });
    }

    const result = await pool.query(
      `INSERT INTO favorite_stops (user_id, stop_id, stop_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, stop_id) DO UPDATE SET stop_name = EXCLUDED.stop_name
       RETURNING *`,
      [userId, stopId, stopName ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Could not save favorite" });
  }
});

app.delete("/favorites/:stopId", async (req, res) => {
  try {
    const { stopId } = req.params;
    const userId = String(req.query.userId || "");
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await pool.query(
      "DELETE FROM favorite_stops WHERE user_id = $1 AND stop_id = $2",
      [userId, stopId]
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Could not remove favorite" });
  }
});

app.get("/favorites", async (req, res) => {
  try {
    const userId = String(req.query.userId || "");
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const result = await pool.query(
      "SELECT id, stop_id, stop_name, created_at FROM favorite_stops WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Could not load favorites" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
