// Browser Scraper — uses agent-browser (headless) for complete data with stickers
// Use when WooCommerce API doesn't provide promo stickers or CDN image URLs
// Compatible with GitHub Actions CI (agent-browser installed globally)
//
// Usage:
//   node src/browser-scraper.mjs --customer jysk --target bathroom
//   node src/browser-scraper.mjs --customer jysk --target kitchen --url "https://jysk.co.uk/homeware/kitchen/drinking-glasses-mugs"

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, '_data');

// Config for browser scraping — category URLs to scrape
const CATEGORY_URLS = {
  jysk: {
    bathroom: [
      'https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers',
      'https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder',
      'https://jysk.co.uk/bathroom/bathroom-accessories/toilet-bins',
      'https://jysk.co.uk/bathroom/bathroom-accessories/toilet-brushes',
      'https://jysk.co.uk/bathroom/bathroom-accessories/accessories',
      'https://jysk.co.uk/bathroom/bathroom-accessories/reed-diffusers',
      'https://jysk.co.uk/bathroom/bathroom-accessories/bathroom-storage',
      'https://jysk.co.uk/bathroom/bathroom-accessories/towel-rails',
    ],
    kitchen: [
      'https://jysk.co.uk/homeware/kitchen/drinking-glasses-mugs',
      'https://jysk.co.uk/homeware/kitchen/plates-bowls-cutlery',
      'https://jysk.co.uk/homeware/kitchen/kitchen-accessories',
    ]
  }
};

// The eval script injected into the browser to extract product data
const EXTRACT_SCRIPT = `
var items = [];
document.querySelectorAll('[class*="product"], [class*="item"], [class*="grid"] > div, [class*="list"] > div').forEach(function(el) {
  var allText = el.textContent.trim();
  if (allText.length < 20 || allText.length > 800) return;

  var nameEl = el.querySelector('h3, .name, [class*="title"], [class*="name"]');
  if (!nameEl) return;
  var name = nameEl.textContent.trim();

  var linkEl = el.querySelector('a[href*="/product/"], a[href*="/bathroom/"], a[href*="/kitchen/"], a[href*="/homeware/"]');
  var url = linkEl ? linkEl.href.split('?')[0] : '';

  // Price elements
  var priceEls = el.querySelectorAll('[class*="price"]');
  var price = '', oldPrice = '';
  priceEls.forEach(function(pe) {
    var t = pe.textContent.trim();
    if (t.includes('£')) {
      if (!price) price = t;
      else if (t !== price) oldPrice = t;
    }
  });

  var imgEl = el.querySelector('img');
  var img = imgEl ? imgEl.src : '';

  // Sticker / promo badge
  var stickerEl = el.querySelector('[class*="sticker"], [class*="badge"], [class*="label"], [class*="promo"], [class*="sale"]');
  var sticker = stickerEl ? stickerEl.textContent.trim() : '';

  // SKU extraction from URL or data attributes
  var sku = '';
  if (url) {
    var skuMatch = url.match(/\\/(\\d{7})\\/);
    if (skuMatch) sku = skuMatch[1];
  }
  if (!sku && el.dataset && el.dataset.sku) sku = el.dataset.sku;
  if (!sku) sku = 'SKU-' + Math.random().toString(36).slice(2, 9);

  items.push({ sku: sku, name: name, price: price, oldPrice: oldPrice, imgUrl: img, url: url, sticker: sticker });
});

// Deduplicate
var seen = {};
var unique = items.filter(function(x) {
  var k = x.name + '|' + x.price;
  if (seen[k]) return false;
  seen[k] = true;
  return true;
});

console.log(JSON.stringify(unique));
`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Check if agent-browser is available
function hasAgentBrowser() {
  try {
    execSync('agent-browser --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Scrape a single URL using agent-browser
async function scrapeUrl(url, categoryName) {
  console.log(`  📄 Scraping: ${url}`);

  try {
    // Open page
    execSync(`agent-browser open "${url}"`, { stdio: 'pipe', timeout: 30000 });
    await sleep(2000);

    // Wait for products to load
    execSync('agent-browser wait --load networkidle', { stdio: 'pipe', timeout: 15000 });
    await sleep(1000);

    // Extract products
    const result = execSync('agent-browser eval --stdin', {
      input: EXTRACT_SCRIPT,
      stdio: 'pipe',
      timeout: 15000
    }).toString().trim();

    let products = [];
    try {
      products = JSON.parse(result);
      // Add category name
      products = products.map(p => ({ ...p, cat: categoryName }));
    } catch {
      console.log(`    ⚠ Failed to parse JSON from ${url}`);
      console.log(`    Raw output (first 200 chars): ${result.slice(0, 200)}`);
    }

    // Close browser
    execSync('agent-browser close', { stdio: 'pipe' });

    return products;
  } catch (e) {
    console.log(`    ❌ Error: ${e.message}`);
    try { execSync('agent-browser close', { stdio: 'pipe' }); } catch {}
    return [];
  }
}

// Main browser scrape function
export async function browserScrape(customerId, targetId, options = {}) {
  const urls = options.urls || CATEGORY_URLS[customerId]?.[targetId];

  if (!urls || urls.length === 0) {
    console.error(`\n❌ No URLs configured for ${customerId}/${targetId}.`);
    console.error('   Add URLs to CATEGORY_URLS in browser-scraper.mjs or pass --url');
    process.exit(1);
  }

  if (!hasAgentBrowser()) {
    console.error('\n❌ agent-browser not found. Install: npm install -g agent-browser && agent-browser install');
    console.error('   Falling back to WooCommerce API scraper: node src/cli.mjs scrape');
    process.exit(1);
  }

  console.log(`\n🌐 Browser scraping ${urls.length} URLs for ${customerId}/${targetId}...`);

  const allProducts = [];
  const byCategory = {};

  for (const url of urls) {
    // Derive category name from URL
    const urlParts = url.replace(/\/$/, '').split('/');
    const catName = urlParts[urlParts.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const products = await scrapeUrl(url, catName);
    allProducts.push(...products);
    byCategory[catName] = products;
    console.log(`    ${catName}: ${products.length} products`);
  }

  // Normalize and deduplicate
  const seen = new Set();
  const unique = allProducts.filter(p => {
    const key = p.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n✅ Total: ${unique.length} unique products`);

  // Save
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const outPath = resolve(DATA_DIR, `${customerId}_${targetId}_browser.json`);
  const output = {
    retailer: customerId.toUpperCase(),
    targetId,
    scrapedAt: new Date().toISOString(),
    source: 'browser',
    totalSkus: unique.length,
    products: unique,
    byCategory
  };
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  💾 Saved to ${outPath}`);

  return output;
}

// Run as standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      args[k] = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
    }
  }

  const customerId = args.customer || 'jysk';
  const targetId = args.target || 'bathroom';
  const urls = args.url ? [args.url] : undefined;

  await browserScrape(customerId, targetId, { urls });
}
