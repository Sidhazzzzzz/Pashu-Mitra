import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { loadModel, predict, incrementalLearn, getUpdateCount } from "./inference.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  await loadModel();

  // Predict mastitis risk from sensor readings
  app.post("/api/predict", (req, res) => {
    try {
      const { ec, temperature } = req.body;
      if (typeof ec !== "number" || typeof temperature !== "number") {
        res.status(400).json({ error: "ec and temperature are required numbers" });
        return;
      }
      const result = predict({ ec, temperature });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Batch predict for multiple cows
  app.post("/api/predict-batch", (req, res) => {
    try {
      const { cows } = req.body;
      if (!Array.isArray(cows)) {
        res.status(400).json({ error: "cows array is required" });
        return;
      }
      const results = cows.map((cow: { id: string; ec: number; temperature: number }) => ({
        id: cow.id,
        ...predict({ ec: cow.ec, temperature: cow.temperature }),
      }));
      res.json({ results, modelUpdates: getUpdateCount() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Incremental learning endpoint
  app.post("/api/learn", (req, res) => {
    try {
      const { ec, temperature, label } = req.body;
      if (typeof ec !== "number" || typeof temperature !== "number" || (label !== 0 && label !== 1)) {
        res.status(400).json({ error: "ec, temperature (numbers) and label (0 or 1) are required" });
        return;
      }
      incrementalLearn({ ec, temperature }, label);
      res.json({ modelUpdates: getUpdateCount() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get model update count
  app.get("/api/model-status", (_req, res) => {
    res.json({ modelUpdates: getUpdateCount() });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
