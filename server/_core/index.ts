import express from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createServer as createViteServer } from "vite";

import { ENV } from "./env.ts";
import { COOKIE_SECRET } from "./cookies.ts";
import { createContext } from "./context.ts";
import { appRouter } from "../routers.ts";
import { oauthRouter } from "./oauth.ts";
import { getPredictiveInsightsWorkflow, scanIssueImage } from "./issueWorkflow.ts";
import { db } from "../db.ts";

async function startServer() {
  const app = express();
  const PORT = ENV.PORT;

  // 1. Enable Cookie Parsing with Secret
  app.use(cookieParser(COOKIE_SECRET));

  // 2. High capacity body parsing for base64 image/video uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 3. API - Base64 Upload Handler
  app.post("/api/upload", (req, res) => {
    try {
      const { file, fileName } = req.body;
      if (!file) {
        return res.status(400).json({ error: "No file content supplied" });
      }

      // Safe clean up filename or generate random
      const cleanFileName = fileName ? fileName.replace(/[^a-zA-Z0-9.-]/g, "_") : `upload_${Date.now()}.jpg`;
      
      // Establish upload directory inside client/public/uploads
      const uploadDir = path.resolve(process.cwd(), "client", "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, cleanFileName);
      
      // Remove data URL prefix if present (e.g. "data:image/jpeg;base64,")
      const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
      
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      
      // Return public routing URL
      res.json({ url: `/uploads/${cleanFileName}` });
    } catch (err: any) {
      console.error("Base64 upload failed:", err);
      res.status(500).json({ error: err.message || "Failed to upload asset" });
    }
  });

  // 3b. API - Analyze Image using Gemini Vision model
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64, fileName, isVideo } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No image content supplied" });
      }

      const scanResult = await scanIssueImage(imageBase64, fileName, isVideo);
      res.json(scanResult);
    } catch (err: any) {
      console.error("Image analysis endpoint failed:", err);
      res.status(500).json({ error: err.message || "Failed to analyze image" });
    }
  });

  // 4. API - Predictive City Infrastructure Insights
  app.get("/api/predictive-insights", async (req, res) => {
    try {
      const issues = await db.getIssues();
      const insights = await getPredictiveInsightsWorkflow(issues);
      res.json(insights);
    } catch (err: any) {
      console.error("Predictive insights generation failed:", err);
      res.status(500).json({ error: "Failed to generate analytics" });
    }
  });

  // 5. Register OAuth Bypass Router
  app.use(oauthRouter);

  // 6. Mount tRPC express middleware at /api/trpc
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static uploads folder (from client/public/uploads or client/uploads)
  app.use("/uploads", express.static(path.resolve(process.cwd(), "client", "public", "uploads")));

  // 7. Vite Middleware for Dev / Static Files for Prod
  if (ENV.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      root: path.resolve(process.cwd(), "client"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Community Hero server active at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup failure:", err);
});
