// Analyzer — price bands, category/material distribution, opportunity detection
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, '_data');

function loadConfig(customerId) {
  const path = resolve(ROOT, 'configs', `${customerId}.json`);
  if (!existsSync(path)) throw new Error(`Config not found: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadEnrichedData(customerId, targetId) {
  // Try enriched first, fall back to raw scraped
  const enrichedPath = resolve(DATA_DIR, `${customerId}_${targetId}_enriched.json`);
  const rawPath = resolve(DATA_DIR, `${customerId}_${targetId}.json`);

  if (existsSync(enrichedPath)) {
    return JSON.parse(readFileSync(enrichedPath, 'utf-8'));
  }
  if (existsSync(rawPath)) {
    console.log('  ⚠ Using raw scraped data (not enriched). Run enrich for material analysis.');
    return JSON.parse(readFileSync(rawPath, 'utf-8'));
  }
  throw new Error(`No data found for ${customerId}_${targetId}. Run scrape first.`);
}

// Parse numeric price from display string
function parsePrice(display) {
  if (!display || display === 'NELP') return null;
  const match = String(display).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Price band analysis
function analyzePriceBands(products, config) {
  const bands = config.priceBands.ranges.map(b => ({ ...b, count: 0, skus: [], totalValue: 0 }));

  let withPrice = 0;
  let withoutPrice = 0;

  products.forEach(p => {
    const price = parsePrice(p.priceDisplay);
    if (price === null) {
      withoutPrice++;
      return;
    }
    withPrice++;

    const band = bands.find(b => price >= b.min && price <= b.max);
    if (band) {
      band.count++;
      band.skus.push(p.sku);
      band.totalValue += price;
    }
  });

  // Calculate percentages
  bands.forEach(b => {
    b.pct = withPrice > 0 ? ((b.count / withPrice) * 100).toFixed(1) : 0;
    b.avgPrice = b.count > 0 ? (b.totalValue / b.count).toFixed(2) : 0;
  });

  return {
    bands: bands.filter(b => b.count > 0),
    totalPriced: withPrice,
    totalUnpriced: withoutPrice,
    overallAvg: withPrice > 0
      ? (bands.reduce((s, b) => s + b.totalValue, 0) / withPrice).toFixed(2)
      : 0
  };
}

// Category breakdown
function analyzeCategories(byCategory, allProducts) {
  const categories = {};

  for (const [catName, catProducts] of Object.entries(byCategory)) {
    const withPrice = catProducts.filter(p => parsePrice(p.priceDisplay) !== null);
    const prices = withPrice.map(p => parsePrice(p.priceDisplay)).filter(p => p !== null);
    const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const onSale = catProducts.filter(p => p.onSale).length;
    const newProducts = catProducts.filter(p => p.sticker && p.sticker.includes('New')).length;

    categories[catName] = {
      name: catName,
      totalSkus: catProducts.length,
      pricedSkus: withPrice.length,
      avgPrice: avgPrice.toFixed(2),
      minPrice: prices.length > 0 ? Math.min(...prices).toFixed(2) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices).toFixed(2) : null,
      onSaleCount: onSale,
      onSalePct: catProducts.length > 0 ? ((onSale / catProducts.length) * 100).toFixed(1) : 0,
      newCount: newProducts
    };
  }

  return categories;
}

// Material distribution
function analyzeMaterials(products) {
  const materials = {};

  products.forEach(p => {
    const cls = p.materialClass || 'UNKNOWN';
    if (!materials[cls]) {
      materials[cls] = { count: 0, skus: [], avgPrice: 0, totalPrice: 0, pricedCount: 0 };
    }
    materials[cls].count++;
    materials[cls].skus.push(p.sku);

    const price = parsePrice(p.priceDisplay);
    if (price !== null) {
      materials[cls].totalPrice += price;
      materials[cls].pricedCount++;
    }
  });

  // Calculate averages
  for (const [name, data] of Object.entries(materials)) {
    data.avgPrice = data.pricedCount > 0 ? (data.totalPrice / data.pricedCount).toFixed(2) : 0;
    data.pct = ((data.count / products.length) * 100).toFixed(1);
  }

  return materials;
}

// Discount/promotion analysis
function analyzeDiscounts(products) {
  const onSale = products.filter(p => p.onSale && p.discountPct > 0);
  const clearance = products.filter(p => p.sticker && p.sticker.includes('While stocks last'));
  const everyday = products.filter(p => p.sticker && p.sticker.includes('EVERYDAY LOW PRICE'));
  const newProducts = products.filter(p => p.sticker && p.sticker.includes('New'));
  const noPromo = products.filter(p => !p.onSale || p.discountPct === 0);

  // Discount depth distribution
  const discountBands = {
    '0-20%': onSale.filter(p => p.discountPct <= 20).length,
    '21-30%': onSale.filter(p => p.discountPct > 20 && p.discountPct <= 30).length,
    '31-40%': onSale.filter(p => p.discountPct > 30 && p.discountPct <= 40).length,
    '41-50%': onSale.filter(p => p.discountPct > 40 && p.discountPct <= 50).length,
    '50%+': onSale.filter(p => p.discountPct > 50).length,
  };

  return {
    totalOnSale: onSale.length,
    onSalePct: products.length > 0 ? ((onSale.length / products.length) * 100).toFixed(1) : 0,
    clearanceCount: clearance.length,
    everydayLowPriceCount: everyday.length,
    newProductCount: newProducts.length,
    fullPriceCount: noPromo.length,
    avgDiscountPct: onSale.length > 0
      ? (onSale.reduce((s, p) => s + p.discountPct, 0) / onSale.length).toFixed(1)
      : 0,
    discountBands,
    topDiscounts: onSale
      .sort((a, b) => b.discountPct - a.discountPct)
      .slice(0, 10)
      .map(p => ({ sku: p.sku, name: p.name, discount: p.discountPct, price: p.priceDisplay, oldPrice: p.oldPriceDisplay }))
  };
}

// Opportunity gap detection
function detectOpportunities(products, byCategory, materialData, priceData, config) {
  const opportunities = [];

  // 1. Missing price points: find price bands with 0 products in each category
  const priceBands = config.priceBands.ranges;
  for (const [catName, catProducts] of Object.entries(byCategory)) {
    const catPrices = catProducts
      .map(p => parsePrice(p.priceDisplay))
      .filter(p => p !== null);

    for (const band of priceBands) {
      const inBand = catPrices.filter(p => p >= band.min && p <= band.max).length;
      if (inBand === 0 && catProducts.length >= 3) {
        // Only flag if the category has enough products to make the gap meaningful
        opportunities.push({
          type: 'price_gap',
          category: catName,
          detail: `No products in ${band.label} range`,
          band,
          significance: 'medium'
        });
      }
    }
  }

  // 2. Underrepresented materials in categories
  if (materialData && Object.keys(materialData).length > 0) {
    const dominantMaterial = Object.entries(materialData)
      .sort((a, b) => b[1].count - a[1].count)[0];

    for (const [catName, catProducts] of Object.entries(byCategory)) {
      const catMaterials = {};
      catProducts.forEach(p => {
        const cls = p.materialClass || 'UNKNOWN';
        catMaterials[cls] = (catMaterials[cls] || 0) + 1;
      });

      // Check if category is missing the dominant material
      if (dominantMaterial && !catMaterials[dominantMaterial[0]] && catProducts.length >= 5) {
        opportunities.push({
          type: 'material_gap',
          category: catName,
          detail: `Missing ${dominantMaterial[0]} (top material overall at ${((dominantMaterial[1].count/products.length)*100).toFixed(0)}%)`,
          significance: 'high'
        });
      }
    }
  }

  // 3. Categories with low product count (potential expansion areas)
  const categorySizes = Object.entries(byCategory)
    .map(([name, prods]) => ({ name, count: prods.length }))
    .sort((a, b) => a.count - b.count);

  const median = categorySizes.length > 0
    ? categorySizes[Math.floor(categorySizes.length / 2)].count
    : 0;

  categorySizes.forEach(c => {
    if (c.count < median * 0.5 && c.count > 0) {
      opportunities.push({
        type: 'expansion_opportunity',
        category: c.name,
        detail: `Only ${c.count} SKUs vs median ${median} — potential for category expansion`,
        significance: 'high'
      });
    }
  });

  // 4. High discount concentration (category may be overstocked/underperforming)
  for (const [catName, catProducts] of Object.entries(byCategory)) {
    const onSale = catProducts.filter(p => p.onSale && p.discountPct > 30).length;
    const pct = catProducts.length > 0 ? (onSale / catProducts.length) * 100 : 0;
    if (pct > 50 && catProducts.length >= 5) {
      opportunities.push({
        type: 'high_discount_alert',
        category: catName,
        detail: `${pct.toFixed(0)}% of products discounted >30% — possible overstock or weak sellers`,
        significance: 'medium'
      });
    }
  }

  return opportunities;
}

// Top sellers estimation (based on discount depth — deeper discounts may indicate slow movers or clearance)
function estimatePerformance(products, byCategory) {
  const topPriced = [...products]
    .filter(p => parsePrice(p.priceDisplay) !== null)
    .sort((a, b) => parsePrice(b.priceDisplay) - parsePrice(a.priceDisplay))
    .slice(0, 20)
    .map(p => ({ sku: p.sku, name: p.name, price: p.priceDisplay, category: p.category }));

  const deepestDiscounts = [...products]
    .filter(p => p.onSale && p.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 20)
    .map(p => ({ sku: p.sku, name: p.name, discount: p.discountPct, price: p.priceDisplay, oldPrice: p.oldPriceDisplay, category: p.category }));

  return { topPriced, deepestDiscounts };
}

// Main analyze function
export function analyze(config, targetId, options = {}) {
  const data = loadEnrichedData(config.name.toLowerCase(), targetId);
  const products = data.products || [];
  const byCategory = data.byCategory || {};

  console.log(`\n📊 Analyzing ${products.length} products across ${Object.keys(byCategory).length} categories...`);

  // 1. Price band analysis
  console.log('\n💰 Price Band Distribution:');
  const priceAnalysis = analyzePriceBands(products, config);
  priceAnalysis.bands.forEach(b => {
    console.log(`  ${b.label}: ${b.count} SKUs (${b.pct}%) — avg ${config.currencySymbol}${b.avgPrice}`);
  });

  // 2. Category breakdown
  console.log('\n📂 Category Breakdown:');
  const categoryAnalysis = analyzeCategories(byCategory, products);
  for (const [name, info] of Object.entries(categoryAnalysis)) {
    console.log(`  ${name}: ${info.totalSkus} SKUs, avg ${config.currencySymbol}${info.avgPrice}, ${info.onSalePct}% on sale`);
  }

  // 3. Material distribution
  console.log('\n🧪 Material Distribution:');
  const materialAnalysis = analyzeMaterials(products);
  for (const [name, info] of Object.entries(materialAnalysis)) {
    console.log(`  ${name}: ${info.count} SKUs (${info.pct}%) — avg ${config.currencySymbol}${info.avgPrice}`);
  }

  // 4. Discount analysis
  console.log('\n🏷 Discount Analysis:');
  const discountAnalysis = analyzeDiscounts(products);
  console.log(`  On sale: ${discountAnalysis.totalOnSale} (${discountAnalysis.onSalePct}%)`);
  console.log(`  Clearance: ${discountAnalysis.clearanceCount}`);
  console.log(`  Everyday Low Price: ${discountAnalysis.everydayLowPriceCount}`);
  console.log(`  New: ${discountAnalysis.newProductCount}`);
  console.log(`  Avg discount: ${discountAnalysis.avgDiscountPct}%`);

  // 5. Opportunity detection
  console.log('\n🎯 Opportunities:');
  const opportunities = detectOpportunities(products, byCategory, materialAnalysis, priceAnalysis, config);
  if (opportunities.length === 0) {
    console.log('  No significant gaps detected.');
  } else {
    opportunities.forEach(o => {
      const icon = o.significance === 'high' ? '🔴' : '🟡';
      console.log(`  ${icon} [${o.type}] ${o.category}: ${o.detail}`);
    });
  }

  // 6. Performance estimation
  const performance = estimatePerformance(products, byCategory);

  // Compile full analysis (with raw data for dashboard rendering)
  const analysisResult = {
    retailer: config.name,
    category: data.category,
    targetId,
    analyzedAt: new Date().toISOString(),
    dataSource: data.scrapedAt || data.enrichedAt,
    scrapedAt: data.scrapedAt,
    enrichedAt: data.enrichedAt,
    baseUrl: config.baseUrl,
    overview: {
      totalSkus: products.length,
      categoryCount: Object.keys(byCategory).length,
      avgPrice: priceAnalysis.overallAvg,
      onSalePct: discountAnalysis.onSalePct,
      clearanceCount: discountAnalysis.clearanceCount,
      newCount: discountAnalysis.newProductCount,
    },
    priceAnalysis,
    categoryAnalysis,
    materialAnalysis,
    discountAnalysis,
    opportunities,
    performance,
    products,
    byCategory
  };

  // Save analysis
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const outPath = resolve(DATA_DIR, `${config.name.toLowerCase()}_${targetId}_analysis.json`);
  writeFileSync(outPath, JSON.stringify(analysisResult, null, 2));
  console.log(`\n💾 Analysis saved to ${outPath}`);

  return { ...analysisResult, products, byCategory };
}

// Run as standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customerId = process.argv[2] || 'jysk';
  const targetId = process.argv[3] || 'bathroom';
  const config = loadConfig(customerId);
  analyze(config, targetId);
}
