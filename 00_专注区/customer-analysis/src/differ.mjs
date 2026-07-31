// Differ — week-over-week comparison of product catalogs
// Detects: new, discontinued, price changes, promo changes
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, '_data');
const SNAPSHOT_DIR = resolve(ROOT, '_snapshots');

function loadConfig(customerId) {
  const path = resolve(ROOT, 'configs', `${customerId}.json`);
  if (!existsSync(path)) throw new Error(`Config not found: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function getDataPath(customerId, targetId, enriched = false) {
  const suffix = enriched ? '_enriched' : '';
  return resolve(DATA_DIR, `${customerId}_${targetId}${suffix}.json`);
}

function loadSnapshot(customerId, targetId) {
  const path = resolve(SNAPSHOT_DIR, `${customerId}_${targetId}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveSnapshot(customerId, targetId, data) {
  if (!existsSync(SNAPSHOT_DIR)) mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const path = resolve(SNAPSHOT_DIR, `${customerId}_${targetId}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  return path;
}

// Archive old snapshots (keep last 12 weeks)
function rotateSnapshots(customerId, targetId) {
  const prefix = `${customerId}_${targetId}_`;
  const existing = readdirSync(SNAPSHOT_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.json') && f !== `${customerId}_${targetId}.json`);

  // Keep only last 12
  if (existing.length > 12) {
    const toDelete = existing.sort().slice(0, existing.length - 12);
    toDelete.forEach(f => {
      const p = resolve(SNAPSHOT_DIR, f);
      console.log(`  🗑 Removing old snapshot: ${f}`);
      // Uncomment to actually delete: unlinkSync(p);
    });
  }
}

// Compare two product sets
function compareProducts(current, previous) {
  const currentMap = new Map(current.map(p => [p.sku, p]));
  const previousMap = new Map(previous.map(p => [p.sku, p]));

  const currentSkus = new Set(currentMap.keys());
  const previousSkus = new Set(previousMap.keys());

  // New products
  const added = [...currentSkus].filter(sku => !previousSkus.has(sku)).map(sku => currentMap.get(sku));

  // Discontinued products
  const removed = [...previousSkus].filter(sku => !currentSkus.has(sku)).map(sku => previousMap.get(sku));

  // Price changes
  const priceChanges = [];
  const promoChanges = [];

  for (const sku of [...currentSkus].filter(s => previousSkus.has(s))) {
    const curr = currentMap.get(sku);
    const prev = previousMap.get(sku);

    const currPrice = parsePrice(curr.priceDisplay);
    const prevPrice = parsePrice(prev.priceDisplay);
    const currOldPrice = parsePrice(curr.oldPriceDisplay);
    const prevOldPrice = parsePrice(prev.oldPriceDisplay);

    if (currPrice !== prevPrice) {
      priceChanges.push({
        sku,
        name: curr.name,
        category: curr.category,
        oldPrice: prevPrice,
        newPrice: currPrice,
        change: currPrice !== null && prevPrice !== null ? (currPrice - prevPrice).toFixed(2) : 'N/A',
        changePct: currPrice !== null && prevPrice !== null && prevPrice > 0
          ? (((currPrice - prevPrice) / prevPrice) * 100).toFixed(1) : 'N/A'
      });
    }

    // Promo status change
    if (curr.sticker !== prev.sticker || curr.onSale !== prev.onSale) {
      promoChanges.push({
        sku,
        name: curr.name,
        category: curr.category,
        prevSticker: prev.sticker || '(none)',
        currSticker: curr.sticker || '(none)',
        price: curr.priceDisplay
      });
    }
  }

  // Sort price changes by magnitude
  priceChanges.sort((a, b) => {
    const aChange = parseFloat(a.change) || 0;
    const bChange = parseFloat(b.change) || 0;
    return Math.abs(bChange) - Math.abs(aChange);
  });

  return { added, removed, priceChanges, promoChanges };
}

function parsePrice(display) {
  if (!display || display === 'NELP') return null;
  const match = String(display).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Main diff function
export function diff(config, targetId, options = {}) {
  const customerId = config.name.toLowerCase();

  // Load current data
  const currentPath = getDataPath(customerId, targetId, true);
  const rawPath = getDataPath(customerId, targetId, false);
  const dataPath = existsSync(currentPath) ? currentPath : rawPath;

  if (!existsSync(dataPath)) {
    throw new Error(`No current data found. Run scrape first.`);
  }

  const current = JSON.parse(readFileSync(dataPath, 'utf-8'));
  const currentProducts = current.products;

  // Load previous snapshot
  const previous = loadSnapshot(customerId, targetId);

  if (!previous) {
    console.log('\n📸 No previous snapshot found — saving baseline snapshot.');
    saveSnapshot(customerId, targetId, current);
    return { isBaseline: true, products: currentProducts, added: [], removed: [], priceChanges: [], promoChanges: [] };
  }

  console.log(`\n🔍 Comparing ${currentProducts.length} current vs ${previous.products.length} previous products...`);

  const changes = compareProducts(currentProducts, previous.products);

  console.log(`\n📊 Weekly Changes:`);
  console.log(`  🆕 New: ${changes.added.length} SKUs`);
  changes.added.forEach(p => console.log(`     ${p.sku} | ${p.name} | ${p.priceDisplay}`));

  console.log(`  🗑 Discontinued: ${changes.removed.length} SKUs`);
  changes.removed.forEach(p => console.log(`     ${p.sku} | ${p.name} | ${p.priceDisplay}`));

  console.log(`  💷 Price changes: ${changes.priceChanges.length} SKUs`);
  changes.priceChanges.forEach(pc => {
    const dir = parseFloat(pc.change) > 0 ? '↑' : '↓';
    const currencySymbol = currentProducts.find(p => p.sku === pc.sku)?.currency || '£';
    console.log(`     ${pc.sku} | ${pc.name}: ${currencySymbol}${pc.oldPrice} → ${currencySymbol}${pc.newPrice} (${dir}${pc.changePct}%)`);
  });

  console.log(`  🏷 Promo changes: ${changes.promoChanges.length} SKUs`);
  changes.promoChanges.forEach(pc => {
    console.log(`     ${pc.sku} | ${pc.name}: "${pc.prevSticker}" → "${pc.currSticker}"`);
  });

  // Save comparison result
  const outPath = resolve(DATA_DIR, `${customerId}_${targetId}_diff.json`);
  const diffOutput = {
    retailer: config.name,
    category: current.category,
    targetId,
    comparedAt: new Date().toISOString(),
    currentDate: current.scrapedAt || current.enrichedAt,
    previousDate: previous.scrapedAt || previous.enrichedAt,
    summary: {
      totalCurrent: currentProducts.length,
      totalPrevious: previous.products.length,
      added: changes.added.length,
      removed: changes.removed.length,
      priceChanges: changes.priceChanges.length,
      promoChanges: changes.promoChanges.length
    },
    ...changes
  };
  writeFileSync(outPath, JSON.stringify(diffOutput, null, 2));
  console.log(`\n💾 Diff saved to ${outPath}`);

  // Update snapshot for next comparison
  rotateSnapshots(customerId, targetId);
  saveSnapshot(customerId, targetId, current);

  return { ...diffOutput, isBaseline: false, currentProducts };
}

// Run as standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customerId = process.argv[2] || 'jysk';
  const targetId = process.argv[3] || 'bathroom';
  const config = loadConfig(customerId);
  diff(config, targetId);
}
