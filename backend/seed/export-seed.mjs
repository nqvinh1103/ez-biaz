import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load FE mock data and export to backend/seed/seed.json
const mockPath = path.resolve(__dirname, "..", "..", "frontend", "src", "mock", "mockData.js");
const mod = await import(mockPath);

const out = {
  USERS: mod.USERS,
  PRODUCTS: mod.PRODUCTS,
  AUCTIONS: mod.AUCTIONS,
  BID_HISTORY: mod.BID_HISTORY,
  CARTS: mod.CARTS,
  ORDERS: mod.ORDERS,
};

const outPath = path.resolve(__dirname, "seed.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Seed exported to: ${outPath}`);
