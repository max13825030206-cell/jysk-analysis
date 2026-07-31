// Scraper — extracts product data via JSON-LD structured data from category pages
// JYSK and many modern retailers embed schema.org Product data in <script type="application/ld+json">
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

// Get subcategory URLs from config
function getSubcategoryUrls(config, targetId) {
  const target = config.targets.find(t => t.id === targetId);
  if (!target) throw new Error(`Target "${targetId}" not found in config`);

  if (target.subcategories && target.subcategories.length > 0) {
    return target.subcategories.map(s => ({ url: s.url, cat: s.name }));
  }

  // Fallback: scrape the main category page and extract all products
  return [{ url: `${config.baseUrl}${target.path}`, cat: target.label }];
}

// Fetch HTML from a URL
async function fetchHtml(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000)
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.text();
}

// Extract products from JSON-LD blocks in HTML
function extractJsonLdProducts(html) {
  const products = [];
  const regex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  const matches = [...html.matchAll(regex)];

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);

      // Case 1: @graph containing Products
      if (data['@graph']) {
        for (const item of data['@graph']) {
          if (item['@type'] === 'Product') {
            products.push(normalizeJsonLdProduct(item));
          }
        }
      }

      // Case 2: CollectionPage with mainEntity ItemList
      if (data['@type'] === 'CollectionPage' && data.mainEntity?.['@type'] === 'ItemList') {
        const itemList = data.mainEntity.itemListElement || [];
        for (const listItem of itemList) {
          const item = listItem.item;
          if (item && item['@type'] === 'Product') {
            products.push(normalizeJsonLdProduct(item));
          }
        }
      }

      // Case 3: Standalone Product
      if (data['@type'] === 'Product') {
        products.push(normalizeJsonLdProduct(data));
      }
    } catch {
      // Skip unparseable blocks
    }
  }

  return products;
}

// Normalize a JSON-LD Product to our common schema
function normalizeJsonLdProduct(p) {
  const offers = p.offers || {};

  // Price: JSON-LD gives current sale price only, regular price might be in HTML
  const priceRaw = parseFloat(offers.price) || null;
  const currency = offers.priceCurrency || 'GBP';
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency + ' ';

  const priceDisplay = priceRaw !== null
    ? `${symbol}${priceRaw.toFixed(2)}`
    : 'NELP';

  return {
    sku: String(p.sku || p.productID || ''),
    name: p.name || '',
    url: p.url || '',
    price: priceRaw,
    priceDisplay,
    oldPrice: null,
    oldPriceDisplay: '',
    currency,
    imgUrl: p.image || '',
    category: '', // Will be set by category scraper
    onSale: false,
    discountPct: 0,
    sticker: '',
    description: p.description || ''
  };
}

// Also try to extract regular prices from HTML (not in JSON-LD)
function extractRegularPrices(html, products) {
  // JYSK renders old prices in <span class="old-price"> or <span class="was-price">
  // Pattern: find SKU and nearby old price
  const updated = products.map(p => { return { ...p }; });

  for (const p of updated) {
    if (!p.sku) continue;

    // Look for the old price near the SKU in the HTML
    const skuIdx = html.indexOf(p.sku);
    if (skuIdx === -1) continue;

    const snippet = html.slice(Math.max(0, skuIdx - 500), skuIdx + 1500);

    // Extract was-price / old-price
    const oldPriceMatch = snippet.match(/(?:was|old)[^<]{0,50}?(?:£|EUR\s*|€)\s*([\d,.]+)/i);
    const wasPriceMatch = snippet.match(/(?:class="[^"]*was[^"]*"|class="[^"]*old[^"]*")[^>]*>[^<]*?(?:£|€)\s*([\d,.]+)/i);
    const anyPrice = snippet.match(/(?:£|€)\s*([\d,.]+)/g);

    if (oldPriceMatch) {
      const oldPrice = parseFloat(oldPriceMatch[1].replace(',', ''));
      if (oldPrice > (p.price || 0)) {
        p.oldPrice = oldPrice;
        const symbol = p.currency === 'GBP' ? '£' : p.currency === 'EUR' ? '€' : '';
        p.oldPriceDisplay = `${symbol}${oldPrice.toFixed(2)}`;
        p.onSale = true;
        p.discountPct = Math.round((1 - (p.price || 0) / oldPrice) * 100);
        p.sticker = p.discountPct > 0 ? `-${p.discountPct}%` : '';
      }
    }

    // Check for "EVERYDAY LOW PRICE" or "New" labels
    if (snippet.includes('EVERYDAY LOW PRICE') || snippet.includes('Everyday low price')) {
      p.sticker = 'EVERYDAY LOW PRICE';
    }
    if (snippet.includes('class="sticker-new"') || snippet.includes('>New<') || snippet.includes('>NEW<')) {
      p.sticker = p.sticker ? 'New' + p.sticker : 'New';
    }
    if (snippet.includes('While stocks last') || snippet.includes('while stocks last')) {
      p.sticker = p.sticker ? p.sticker + ' While stocks last' : 'While stocks last';
    }
  }

  return updated;
}

// Scrape all categories for a target
export async function scrape(config, targetId, options = {}) {
  const customerId = config.name.toLowerCase();
  const urls = getSubcategoryUrls(config, targetId);

  console.log(`\n🔍 Scraping ${urls.length} category pages for "${targetId}"...`);

  const allProducts = [];
  const byCategory = {};

  for (const { url, cat } of urls) {
    try {
      console.log(`  📄 ${cat}...`);
      const html = await fetchHtml(url);

      // Extract JSON-LD products
      let products = extractJsonLdProducts(html);

      // Try to extract regular prices from HTML
      products = extractRegularPrices(html, products);

      // Set category name
      products = products.map(p => ({ ...p, category: cat }));

      console.log(`     ${products.length} products`);
      allProducts.push(...products);
      byCategory[cat] = products;
    } catch (e) {
      console.log(`     ❌ Error: ${e.message}`);
      byCategory[cat] = [];
    }

    // Polite delay between requests
    if (urls.indexOf({ url, cat }) < urls.length - 1) {
      await sleep(1500);
    }
  }

  // Deduplicate by SKU
  const seen = new Set();
  const unique = allProducts.filter(p => {
    if (!p.sku || seen.has(p.sku)) return false;
    seen.add(p.sku);
    return true;
  });

  console.log(`\n✅ Total: ${allProducts.length} products (${unique.length} unique SKUs)`);

  // Save
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const outPath = resolve(DATA_DIR, `${customerId}_${targetId}.json`);
  const output = {
    retailer: config.name,
    category: config.targets.find(t => t.id === targetId)?.label || targetId,
    targetId,
    scrapedAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    totalSkus: unique.length,
    source: 'jsonld',
    categories: urls.map(u => u.cat),
    products: unique,
    byCategory
  };
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  💾 Saved to ${outPath}`);

  return output;
}

// Fallback: try WooCommerce API (faster but less data)
async function scrapeViaApi(config, targetId) {
  const apiBase = `${config.baseUrl}/wp-json/wc/store/v1`;
  const target = config.targets.find(t => t.id === targetId);
  if (!target) throw new Error(`Target "${targetId}" not found`);

  // Try to get categories
  let categories;
  try {
    categories = await fetchAllPages(`${apiBase}/products/categories`);
  } catch (e) {
    throw new Error(`WooCommerce API not available at ${config.baseUrl}. Use JSON-LD URLs in CATEGORY_URLS.`);
  }

  console.log(`  Found ${categories.length} categories via API`);

  // Filter and fetch products (simplified — just get all in related categories)
  const allProducts = [];
  for (const cat of categories.slice(0, 20)) {
    try {
      const prods = await fetchAllPages(`${apiBase}/products?category=${cat.id}&per_page=100`);
      const normalized = prods.map(p => ({
        sku: String(p.sku || p.id),
        name: p.name,
        url: p.permalink,
        price: p.prices?.price ? parseFloat(p.prices.price) / 100 : null,
        priceDisplay: p.prices?.price ? `${p.prices.currency_symbol || ''}${(parseFloat(p.prices.price)/100).toFixed(2)}` : 'NELP',
        oldPrice: p.prices?.regular_price ? parseFloat(p.prices.regular_price) / 100 : null,
        oldPriceDisplay: p.prices?.regular_price ? `${p.prices.currency_symbol || ''}${(parseFloat(p.prices.regular_price)/100).toFixed(2)}` : '',
        currency: p.prices?.currency_code || 'GBP',
        imgUrl: (p.images || [])[0]?.src || '',
        category: cat.name,
        onSale: p.on_sale || false,
        discountPct: 0,
        sticker: ''
      }));
      allProducts.push(...normalized);
    } catch {}
  }

  const seen = new Set();
  const unique = allProducts.filter(p => { if (seen.has(p.sku)) return false; seen.add(p.sku); return true; });

  console.log(`  ✅ ${unique.length} unique products via API`);

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const outPath = resolve(DATA_DIR, `${config.name.toLowerCase()}_${targetId}.json`);
  const output = {
    retailer: config.name,
    category: target.label,
    targetId,
    scrapedAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    totalSkus: unique.length,
    source: 'woocommerce-api',
    products: unique,
    byCategory: {}
  };
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  💾 Saved to ${outPath}`);
  return output;
}

async function fetchAllPages(baseUrl) {
  let page = 1;
  const all = [];
  while (true) {
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });
    if (!resp.ok) break;
    const items = await resp.json();
    if (!Array.isArray(items)) break;
    all.push(...items);
    if (items.length < 100) break;
    page++;
  }
  return all;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Run as standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customerId = process.argv[2] || 'jysk';
  const targetId = process.argv[3] || 'bathroom';
  const config = loadConfig(customerId);
  await scrape(config, targetId);
}
