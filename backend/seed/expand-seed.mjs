import fs from "node:fs";
import path from "node:path";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function maxNumericId(list, prefix) {
  let max = 0;
  for (const it of list) {
    const id = typeof it === "string" ? it : it.id;
    if (typeof id !== "string") continue;
    if (!id.startsWith(prefix)) continue;
    const n = Number.parseInt(id.slice(prefix.length), 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return max;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Run from backend/seed
const repoRoot = path.resolve(process.cwd(), "..", "..");
const seedSource = path.resolve(repoRoot, "backend", "seed", "seed.json");
const seedPublish = path.resolve(repoRoot, "backend", "src", "seed", "seed.json");

const seed = readJson(seedSource);

const sellers = seed.USERS.filter((u) => u.role === "seller").map((u) => u.id);
if (!sellers.length) throw new Error("No sellers found in seed.USERS");

const fandoms = [
  "BLACKPINK",
  "BTS",
  "TWICE",
  "NewJeans",
  "IVE",
  "LE SSERAFIM",
  "SEVENTEEN",
  "Stray Kids",
  "Red Velvet",
  "aespa",
  "(G)I-DLE",
  "EXO",
];

const artists = [
  "BLACKPINK",
  "BTS",
  "TWICE",
  "NewJeans",
  "IVE",
  "LE SSERAFIM",
  "SEVENTEEN",
  "Stray Kids",
  "Red Velvet",
  "aespa",
  "(G)I-DLE",
  "EXO",
];

const types = ["Photocard", "Album", "Lightstick", "Poster", "Merch", "Badge"];
const conditions = ["new", "like new", "good", "used"];

const baseImages = seed.PRODUCTS.slice(0, 10).map((p) => p.image).filter(Boolean);
const fallbackImage = baseImages[0] || "https://via.placeholder.com/600x600?text=EzBias";

const productStart = maxNumericId(seed.PRODUCTS, "p") + 1;
const auctionStart = maxNumericId(seed.AUCTIONS, "a") + 1;

const ADD_PRODUCTS = 120;
const ADD_AUCTIONS = 24;

for (let i = 0; i < ADD_PRODUCTS; i++) {
  const id = `p${productStart + i}`;
  const fandom = pick(fandoms, i);
  const artist = pick(artists, i);
  const type = pick(types, i);
  const condition = pick(conditions, i);
  const sellerId = pick(sellers, i);

  const price = [59000, 99000, 149000, 199000, 299000, 399000, 499000, 699000, 899000][i % 9];
  const stock = 1 + (i % 12);

  seed.PRODUCTS.push({
    id,
    fandom,
    artist,
    name: `${artist} ${type} #${i + 1}`,
    type,
    condition,
    price,
    stock,
    sellerId,
    image: baseImages[i % baseImages.length] || fallbackImage,
    description: `Demo item for ${artist} (${fandom}). Great for testing search by fandom/group and price range.`,
    createdAt: todayISO(),
  });
}

for (let i = 0; i < ADD_AUCTIONS; i++) {
  const id = `a${auctionStart + i}`;
  const fandom = pick(fandoms, i + 3);
  const artist = pick(artists, i + 3);
  const sellerId = pick(sellers, i + 1);

  const floorPrice = [99000, 149000, 199000, 299000, 399000, 499000][i % 6];
  const currentBid = floorPrice + (i % 5) * 20000;

  const ends = new Date(Date.now() + (i + 1) * 6 * 60 * 60 * 1000);

  seed.AUCTIONS.push({
    id,
    fandom,
    artist,
    name: `${artist} Auction Lot #${i + 1}`,
    description: `Demo auction for ${artist}.`,
    floorPrice,
    currentBid,
    sellerId,
    endsAt: ends.toISOString(),
    image: baseImages[i % baseImages.length] || fallbackImage,
    isUrgent: i % 3 === 0,
    isLive: true,
    containImage: true,
  });
}

writeJson(seedSource, seed);
writeJson(seedPublish, seed);

console.log(`Expanded seed: +${ADD_PRODUCTS} products, +${ADD_AUCTIONS} auctions`);
console.log(`- ${seedSource}`);
console.log(`- ${seedPublish}`);
