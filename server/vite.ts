import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url'; 
import { createServer as createViteServer, createLogger } from "vite";
import { type Server as HttpServer } from "http"; 
import viteConfigFromOriginalFile from "../vite.config"; 

const viteLogger = createLogger();

const __filename_current_module = fileURLToPath(import.meta.url);
const __dirname_of_bundle = path.dirname(__filename_current_module); 
const projectRoot = path.resolve(__dirname_of_bundle, '..'); 

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, httpServer: HttpServer) { 
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: httpServer }, 
    allowedHosts: true as const,
    fs: {
      strict: false, 
    },
  };

  const configForViteServer = {
    root: path.resolve(projectRoot, "client"),
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "client", "src"),
        "@shared": path.resolve(projectRoot, "shared"),
        "@assets": path.resolve(projectRoot, "attached_assets"),
      },
    },

    plugins: viteConfigFromOriginalFile.plugins, 
    server: {
      ...viteConfigFromOriginalFile.server, 
      ...serverOptions, 
      fs: { 
          ...(viteConfigFromOriginalFile.server?.fs || {}),
          ...serverOptions.fs,
      }
    },

    configFile: false as const,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options?: { timestamp?: boolean; clear?: boolean; error?: Error | null; }) => {
        viteLogger.error(msg, options); 
      },
    },
    appType: "custom" as const,
  };

  const vite = await createViteServer(configForViteServer);

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(projectRoot, "client", "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(projectRoot, "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
