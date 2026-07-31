// Enricher — visits product detail pages to extract material, offers, and specs
// Uses JSON-LD Product schema from detail pages (more reliable than HTML parsing)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, '_data');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function loadConfig(customerId) {
  const path = resolve(ROOT, 'configs', `${customerId}.json`);
  if (!existsSync(path)) throw new Error(`Config not found: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadScrapedData(customerId, targetId) {
  const path = resolve(DATA_DIR, `${customerId}_${targetId}.json`);
  if (!existsSync(path)) throw new Error(`Scraped data not found: ${path}. Run scrape first.`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveEnrichedData(customerId, targetId, data) {
  const path = resolve(DATA_DIR, `${customerId}_${targetId}_enriched.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`  💾 Saved enriched data to ${path}`);
  return path;
}

// Extract Product JSON-LD from a detail page
function extractProductJsonLd(html) {
  const regex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  const matches = [...html.matchAll(regex)];

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);

      // Look for standalone Product (detail page has Product, not CollectionPage)
      if (data['@type'] === 'Product') {
        return data;
      }

      // Some pages have @graph
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (item['@type'] === 'Product') {
            return item;
          }
        }
      }
    } catch {
      // Skip unparseable blocks
    }
  }

  return null;
}

// Classify material using config keywords
function classifyMaterial(materialText, materialKeywords) {
  if (!materialText) return 'UNKNOWN';

  const t = materialText.toLowerCase();

  for (const [className, keywords] of Object.entries(materialKeywords)) {
    for (const kw of keywords) {
      if (t.includes(kw.toLowerCase())) return className.toUpperCase();
    }
  }

  return 'OTHER';
}

// Extract regular (was) price from HTML for sale detection
function extractRegularPriceFromHtml(html, currentPrice) {
  // JYSK shows old price in structured elements
  // Look for "was" or old-price patterns
  const patterns = [
    /"was"[^>]*>\s*(?:£|EUR\s*|€)\s*([\d,.]+)/i,
    /was\s*(?:£|€)\s*([\d,.]+)/i,
    /regular.?price[^>]*>\s*(?:£|€)\s*([\d,.]+)/i,
    /old.?price[^>]*>\s*(?:£|€)\s*([\d,.]+)/i,
    /"priceCurrency"[^}]+"price"\s*:\s*"?([\d.]+)/g
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const oldPrice = parseFloat(match[1].replace(',', ''));
      if (oldPrice > (currentPrice || 0)) {
        return oldPrice;
      }
    }
  }

  return null;
}

// Enrich a single product by visiting its detail page
async function enrichProduct(product, config, retries = 2) {
  if (!product.url) {
    return { ...product, material: null, materialClass: 'NO_URL', enrichedAt: new Date().toISOString() };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(product.url, {
        headers: { 'User-Agent': UA },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });

      if (!resp.ok) {
        if (attempt < retries) { await sleep(1000 * (attempt + 1)); continue; }
        return { ...product, material: `HTTP_${resp.status}`, materialClass: 'ERROR', enrichedAt: new Date().toISOString() };
      }

      const html = await resp.text();

      // Extract Product JSON-LD
      const jsonLd = extractProductJsonLd(html);

      let material = null;
      let materialClass = 'UNKNOWN';
      let oldPrice = product.oldPrice;
      let oldPriceDisplay = product.oldPriceDisplay;
      let onSale = product.onSale;
      let discountPct = product.discountPct;
      let sticker = product.sticker;
      let description = product.description;

      if (jsonLd) {
        // Material from JSON-LD
        material = jsonLd.material || null;
        materialClass = classifyMaterial(material, config.materialKeywords);

        // Description
        if (jsonLd.description && jsonLd.description.length > 5) {
          description = jsonLd.description;
        }

        // Aggregate rating
        if (jsonLd.aggregateRating) {
          product.rating = parseFloat(jsonLd.aggregateRating.ratingValue) || null;
          product.reviewCount = parseInt(jsonLd.aggregateRating.reviewCount) || 0;
        }

        // Brand
        if (jsonLd.brand) {
          product.brand = typeof jsonLd.brand === 'string' ? jsonLd.brand : jsonLd.brand.name || '';
        }
      }

      // Try to find regular price in HTML for sale detection
      if (!oldPrice) {
        const regularPrice = extractRegularPriceFromHtml(html, product.price);
        if (regularPrice && regularPrice > (product.price || 0)) {
          oldPrice = regularPrice;
          const symbol = product.currency === 'GBP' ? '£' : product.currency === 'EUR' ? '€' : '';
          oldPriceDisplay = `${symbol}${regularPrice.toFixed(2)}`;
          onSale = true;
          discountPct = Math.round((1 - (product.price || 0) / regularPrice) * 100);
          sticker = discountPct > 0 ? `-${discountPct}%` : '';
        }
      }

      // Check for stickers in HTML
      if (html.includes('EVERYDAY LOW PRICE') || html.includes('Everyday low price')) {
        sticker = sticker ? 'EVERYDAY LOW PRICE' + ' ' + sticker : 'EVERYDAY LOW PRICE';
      }
      if (html.includes('While stocks last') || html.includes('while stocks last')) {
        sticker = sticker ? sticker + ' While stocks last' : 'While stocks last';
      }

      return {
        ...product,
        material,
        materialClass,
        description,
        oldPrice,
        oldPriceDisplay,
        onSale,
        discountPct,
        sticker,
        enrichedAt: new Date().toISOString()
      };

    } catch (e) {
      if (attempt < retries) { await sleep(1000 * (attempt + 1)); continue; }
      return {
        ...product,
        material: `ERROR: ${e.message}`,
        materialClass: 'ERROR',
        enrichedAt: new Date().toISOString()
      };
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Main enrich function
export async function enrich(config, targetId, options = {}) {
  const data = loadScrapedData(config.name.toLowerCase(), targetId);
  const products = data.products;

  if (!products || products.length === 0) {
    console.log('  ⚠ No products to enrich.');
    return data;
  }

  const batchSize = options.batchSize || 5;
  const delay = options.delay || 1000;
  const skipExisting = options.skipExisting !== false;

  // Check which products already have material data
  let toEnrich = products;
  if (skipExisting) {
    const missing = products.filter(p => !p.materialClass || p.materialClass === 'UNKNOWN');
    if (missing.length < products.length) {
      console.log(`  ⏭ Skipping ${products.length - missing.length} already-enriched products.`);
    }
    toEnrich = missing;
  }

  console.log(`\n🔬 Enriching ${toEnrich.length} products (batch size: ${batchSize}, delay: ${delay}ms)...`);

  let completed = 0;
  const enriched = [];

  for (let i = 0; i < toEnrich.length; i += batchSize) {
    const batch = toEnrich.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(p => enrichProduct(p, config, options.retries || 1)));
    enriched.push(...results);
    completed += batch.length;
    console.log(`  [${completed}/${toEnrich.length}] ${results.map(r => `${r.sku}: ${r.materialClass}`).join(', ')}`);

    if (i + batchSize < toEnrich.length) {
      await sleep(delay);
    }
  }

  // Merge enriched products back with already-enriched ones
  const enrichedMap = new Map(enriched.map(p => [p.sku, p]));
  const allEnriched = products.map(p => enrichedMap.get(p.sku) || p);

  // Update byCategory too
  const enrichedByCategory = {};
  for (const [cat, catProducts] of Object.entries(data.byCategory || {})) {
    enrichedByCategory[cat] = catProducts.map(p => enrichedMap.get(p.sku) || p);
  }

  // Summary
  const summary = {};
  allEnriched.forEach(p => {
    const cls = p.materialClass || 'UNKNOWN';
    if (!summary[cls]) summary[cls] = 0;
    summary[cls]++;
  });

  console.log(`\n📊 Material distribution:`);
  for (const [cls, count] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cls}: ${count} SKUs`);
  }

  const output = {
    ...data,
    products: allEnriched,
    byCategory: enrichedByCategory,
    enrichedAt: new Date().toISOString(),
    materialSummary: summary
  };

  saveEnrichedData(config.name.toLowerCase(), targetId, output);
  return output;
}

// Run as standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customerId = process.argv[2] || 'jysk';
  const targetId = process.argv[3] || 'bathroom';
  const config = loadConfig(customerId);
  await enrich(config, targetId);
}
