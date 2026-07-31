// Dashboard — generates professional standalone HTML with embedded data and visualizations
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, '_data');
const OUTPUT_DIR = resolve(ROOT, 'output');

function loadConfig(customerId) {
  const path = resolve(ROOT, 'configs', `${customerId}.json`);
  if (!existsSync(path)) throw new Error(`Config not found: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadData(customerId, targetId) {
  const customer = customerId.toLowerCase();
  const sources = [
    ['_analysis.json', 'analysis'],
    ['_enriched.json', 'enriched'],
    ['.json', 'raw']
  ];

  for (const [suffix, type] of sources) {
    const path = resolve(DATA_DIR, `${customer}_${targetId}${suffix}`);
    if (existsSync(path)) {
      const raw = JSON.parse(readFileSync(path, 'utf-8'));
      return { data: raw, type };
    }
  }
  throw new Error(`No data found for ${customer}_${targetId}. Run scrape first.`);
}

function loadDiff(customerId, targetId) {
  const path = resolve(DATA_DIR, `${customerId}_${targetId}_diff.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// ─── HTML Helpers ───

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parsePrice(display) {
  if (!display || display === 'NELP') return null;
  const match = String(display).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// ─── Product Card ───

function productCard(p, config) {
  const price = p.priceDisplay || 'NELP';
  const oldPrice = p.oldPriceDisplay || '';
  const hasOldPrice = oldPrice && oldPrice !== price;
  const imgUrl = p.imgUrl || '';
  const url = p.url || '';
  const matClass = (p.materialClass || '').toLowerCase();
  const matName = p.materialClass && p.materialClass !== 'UNKNOWN' ? p.materialClass : '';
  const discount = p.discountPct > 0 ? `-${p.discountPct}%` : '';

  let tags = '';
  if (discount) tags += `<span class="tag tag-sale">${discount}</span>`;
  if (p.sticker && p.sticker.includes('EVERYDAY')) tags += '<span class="tag tag-edlp">EDLP</span>';
  if (p.sticker && p.sticker.includes('While stocks last')) tags += '<span class="tag tag-clearance">清仓</span>';
  if (p.sticker && p.sticker.includes('New')) tags += '<span class="tag tag-new">New</span>';

  return `
    <a class="product-card ${matClass}" href="${url}" target="_blank" rel="noopener" data-mat="${matClass}" data-cat="${esc(p.category || '')}">
      <div class="product-img">
        ${imgUrl ? `<img src="${imgUrl}" alt="${esc(p.name)}" loading="lazy">` : '<div class="no-img">No Image</div>'}
        ${tags ? `<div class="product-tags">${tags}</div>` : ''}
      </div>
      <div class="product-body">
        <div class="product-name">${esc(p.name)}</div>
        ${matName ? `<span class="mat-badge mat-${matClass}">${matName}</span>` : ''}
        <div class="product-price-row">
          <span class="price">${price}</span>
          ${hasOldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
        </div>
      </div>
    </a>`;
}

// ─── Main Generator ───

export function generateDashboard(config, targetId, options = {}) {
  const customerId = config.name.toLowerCase();
  const { data: rawData, type: dataType } = loadData(customerId, targetId);

  const products = rawData.products || [];
  const byCategory = rawData.byCategory || {};

  const overview = rawData.overview || {};
  const priceAnalysis = rawData.priceAnalysis || { bands: [], overallAvg: 0 };
  const categoryAnalysis = rawData.categoryAnalysis || {};
  const materialAnalysis = rawData.materialAnalysis || {};
  const discountAnalysis = rawData.discountAnalysis || {};
  const opportunities = rawData.opportunities || [];

  const diffData = loadDiff(customerId, targetId);

  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const weekNum = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const y = d.getUTCFullYear();
    const z = new Date(Date.UTC(y, 0, 1));
    return `W${Math.ceil(((d - z) / 86400000 + z.getUTCDay() + 1) / 7)}`;
  })();

  const currencySymbol = config.currencySymbol || '£';
  const targetLabel = rawData.category || config.targets.find(t => t.id === targetId)?.label || targetId;

  // ─── Category Sections ───

  const categorySections = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([catName, catProducts]) => {
      const info = categoryAnalysis[catName] || {};
      const sorted = [...catProducts].sort((a, b) => (parsePrice(a.priceDisplay) || 999) - (parsePrice(b.priceDisplay) || 999));
      const cards = sorted.map(p => productCard(p, config)).join('\n');
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      return `
      <section class="category-section" id="cat-${catSlug}">
        <div class="category-header">
          <h3>${esc(catName)}</h3>
          <span class="category-stats">
            ${info.totalSkus || catProducts.length} SKUs
            ${info.avgPrice ? `· avg ${currencySymbol}${info.avgPrice}` : ''}
            ${info.onSalePct && parseFloat(info.onSalePct) > 0 ? `· ${info.onSalePct}% on sale` : ''}
          </span>
        </div>
        <div class="product-grid">${cards}</div>
      </section>`;
    }).join('\n');

  // ─── Price Band Chart ───

  const maxBandCount = Math.max(...priceAnalysis.bands.map(b => b.count), 1);
  const priceBandBars = priceAnalysis.bands.map(b => {
    const pct = (b.count / maxBandCount) * 100;
    return `
      <div class="bar-row">
        <span class="bar-label">${b.label}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${b.count} <span class="bar-pct">(${b.pct}%)</span></span>
      </div>`;
  }).join('\n');

  // ─── Material Distribution ───

  const materialEntries = Object.entries(materialAnalysis)
    .filter(([name]) => name !== 'UNKNOWN' && name !== 'ERROR')
    .sort((a, b) => b[1].count - a[1].count);

  const maxMatCount = Math.max(...materialEntries.map(([, d]) => d.count), 1);
  const materialBars = materialEntries.map(([name, data]) => {
    const pct = (data.count / maxMatCount) * 100;
    const cls = name.toLowerCase();
    return `
      <div class="bar-row">
        <span class="bar-label">${name}</span>
        <div class="bar-track">
          <div class="bar-fill bar-${cls}" style="width:${pct}%"></div>
        </div>
        <span class="bar-value">${data.count} <span class="bar-pct">(${data.pct}%)</span> · avg ${currencySymbol}${data.avgPrice}</span>
      </div>`;
  }).join('\n');

  // ─── Filter Buttons ───

  const allMats = [...new Set(products.map(p => (p.materialClass || 'UNKNOWN').toLowerCase()))].filter(m => m !== 'unknown' && m !== 'error');
  const matFilterBtns = allMats.map(m => `<button class="filter-btn mat-filter" data-mat="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</button>`).join('\n');

  // ─── Opportunity Cards ───

  const oppHtml = opportunities.length > 0 ? `
    <section class="section">
      <h2>Gap & Opportunity Analysis</h2>
      <p class="section-sub">Automatically detected market gaps and competitive opportunities</p>
      <div class="opp-grid">
        ${opportunities.map(o => `
          <div class="opp-card opp-${o.significance}">
            <div class="opp-type">${o.type.replace(/_/g, ' ')}</div>
            <h4>${esc(o.category)}</h4>
            <p>${esc(o.detail)}</p>
          </div>
        `).join('\n')}
      </div>
    </section>` : '';

  // ─── Weekly Diff ───

  let diffHtml = '';
  if (diffData && !diffData.isBaseline) {
    diffHtml = `
    <section class="section">
      <h2>Weekly Changes</h2>
      <p class="section-sub">${diffData.previousDate?.slice(0, 10) || 'previous week'} → ${diffData.currentDate?.slice(0, 10) || 'current week'}</p>
      <div class="stats-grid">
        <div class="stat-card ${diffData.summary.added > 0 ? 'stat-positive' : ''}">
          <span class="stat-num">+${diffData.summary.added}</span>
          <span class="stat-lbl">New SKUs</span>
        </div>
        <div class="stat-card ${diffData.summary.removed > 0 ? 'stat-negative' : ''}">
          <span class="stat-num">−${diffData.summary.removed}</span>
          <span class="stat-lbl">Discontinued</span>
        </div>
        <div class="stat-card ${diffData.summary.priceChanges > 0 ? 'stat-warning' : ''}">
          <span class="stat-num">${diffData.summary.priceChanges}</span>
          <span class="stat-lbl">Price Changes</span>
        </div>
        <div class="stat-card ${diffData.summary.promoChanges > 0 ? 'stat-info' : ''}">
          <span class="stat-num">${diffData.summary.promoChanges}</span>
          <span class="stat-lbl">Promo Changes</span>
        </div>
      </div>
      ${diffData.added?.length > 0 ? `
      <div class="diff-section">
        <h4 class="diff-new">New Products (${diffData.added.length})</h4>
        <div class="diff-list">${diffData.added.slice(0, 12).map(p => `<span class="diff-chip chip-new">${esc(p.name)} · ${p.priceDisplay || ''}</span>`).join('')}${diffData.added.length > 12 ? `<span class="diff-chip">+${diffData.added.length - 12} more</span>` : ''}</div>
      </div>` : ''}
      ${diffData.removed?.length > 0 ? `
      <div class="diff-section">
        <h4 class="diff-removed">Discontinued (${diffData.removed.length})</h4>
        <div class="diff-list">${diffData.removed.slice(0, 12).map(p => `<span class="diff-chip chip-removed">${esc(p.name)}</span>`).join('')}${diffData.removed.length > 12 ? `<span class="diff-chip">+${diffData.removed.length - 12} more</span>` : ''}</div>
      </div>` : ''}
      ${diffData.priceChanges?.length > 0 ? `
      <div class="diff-section">
        <h4 class="diff-price">Price Changes (${diffData.priceChanges.length})</h4>
        <div class="diff-list">${diffData.priceChanges.slice(0, 15).map(pc => {
          const dir = parseFloat(pc.change) >= 0 ? '↑' : '↓';
          const cls = dir === '↑' ? 'chip-up' : 'chip-down';
          return `<span class="diff-chip ${cls}">${esc(pc.name)}: ${currencySymbol}${pc.oldPrice} → ${currencySymbol}${pc.newPrice} (${dir}${pc.changePct}%)</span>`;
        }).join('')}</div>
      </div>` : ''}
    </section>`;
  }

  // ─── Material Legend ───

  const matColors = {
    glass: '#7eb8c9', ceramic: '#c4956a', polyresin: '#9b8ec4',
    metal: '#a0a0a0', wood: '#8faa6b', natural: '#b8956a', plastic: '#e0a85c'
  };
  const usedMats = materialEntries.map(([name]) => name.toLowerCase());
  const legendItems = Object.entries(matColors)
    .filter(([name]) => usedMats.includes(name))
    .map(([name, color]) => `<span class="legend-item"><i style="background:${color}"></i>${name.charAt(0).toUpperCase() + name.slice(1)}</span>`)
    .join('\n');

  // ─── Assemble HTML ───

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(config.name)} — ${esc(targetLabel)} · Market Intelligence</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
/* ═══════════════════════════ Design System ═══════════════════════════ */
:root {
  --bg: #f8f5f0; --card: #fff; --text: #2d2a26; --muted: #6b6560;
  --accent: #1a4a3e; --accent-light: #2a6a5e;
  --gold: #c8974a; --warm: #d4855e;
  --ceramic: #c4956a; --glass: #7eb8c9; --polyresin: #9b8ec4;
  --metal: #a0a0a0; --wood: #8faa6b; --natural: #b8956a; --plastic: #e0a85c;
  --new: #4a8c5c; --sale: #d4493e; --edlp: #5b7a9e; --clearance: #c4704a;
  --shadow: 0 2px 12px rgba(0,0,0,.06); --radius: 10px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.container { max-width: 1320px; margin: 0 auto; padding: 0 24px; }

/* ─── Hero ─── */
.hero {
  background: linear-gradient(165deg, #1a3a34 0%, #2a5a4e 50%, #1a4a3e 100%);
  color: #fff; padding: 52px 0 44px; position: relative; overflow: hidden;
}
.hero::after {
  content: ''; position: absolute; top: 0; right: 0; width: 400px; height: 100%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,.06) 0%, transparent 70%);
}
.hero-inner { position: relative; z-index: 1; }
.hero-label { font-size: .72rem; letter-spacing: .15em; text-transform: uppercase; opacity: .55; margin-bottom: 12px; font-weight: 500; }
.hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 400; letter-spacing: -0.5px; line-height: 1.15; }
.hero h1 em { font-style: italic; color: rgba(255,255,255,.7); }
.hero p { margin-top: 10px; opacity: .75; font-size: .95rem; max-width: 520px; font-weight: 300; }
.hero-meta { margin-top: 20px; font-size: .78rem; opacity: .5; }
.hero-stats { display: flex; gap: 40px; margin-top: 36px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,.12); flex-wrap: wrap; }
.hero-stat h3 { font-family: 'DM Serif Display', serif; font-size: 1.8rem; font-weight: 400; }
.hero-stat p { font-size: .72rem; opacity: .5; margin-top: 2px; text-transform: uppercase; letter-spacing: .06em; }

/* ─── KPI Row ─── */
.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin: -28px 0 32px; }
.kpi {
  background: var(--card); border-radius: var(--radius); padding: 20px;
  text-align: center; box-shadow: var(--shadow); cursor: default;
  border: 2px solid transparent; transition: transform .12s, box-shadow .12s, border-color .12s;
}
.kpi:hover { transform: translateY(-2px); box-shadow: 0 4px 18px rgba(0,0,0,.12); border-color: var(--accent); }
.kpi .val { font-size: 1.7rem; font-weight: 700; color: var(--accent); }
.kpi .lbl { font-size: .75rem; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .04em; }

/* ─── Sections ─── */
.section { margin: 40px 0 24px; }
.section h2 {
  font-family: 'DM Serif Display', serif; font-size: 1.35rem; font-weight: 400;
  color: var(--accent); border-bottom: 2px solid var(--accent);
  padding-bottom: 8px; margin-bottom: 8px;
}
.section-sub { font-size: .85rem; color: var(--muted); margin-bottom: 20px; }

/* ─── Stats Grid ─── */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
.stat-card {
  background: var(--card); border-radius: var(--radius); padding: 18px 20px;
  text-align: center; box-shadow: var(--shadow);
}
.stat-card.stat-positive { border-top: 3px solid var(--new); }
.stat-card.stat-negative { border-top: 3px solid var(--sale); }
.stat-card.stat-warning { border-top: 3px solid var(--warm); }
.stat-card.stat-info { border-top: 3px solid var(--edlp); }
.stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text); }
.stat-lbl { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }

/* ─── Filter Bar ─── */
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.filter-btn {
  padding: 7px 16px; border-radius: 20px; border: 1.5px solid #d4cec7;
  background: var(--card); cursor: pointer; font-size: .8rem; font-weight: 500;
  transition: all .15s; color: var(--text); font-family: inherit;
}
.filter-btn:hover { border-color: var(--accent); color: var(--accent); }
.filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ─── Product Grid ─── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.product-card {
  background: var(--card); border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow); text-decoration: none; color: inherit;
  transition: transform .15s, box-shadow .15s; display: flex; flex-direction: column;
  border: 1px solid #f0ede8;
}
.product-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,.1); }
.product-card.hidden { display: none; }
.product-img {
  background: #f2ede6; height: 200px; display: flex; align-items: center;
  justify-content: center; position: relative; overflow: hidden;
}
.product-img img {
  max-width: 85%; max-height: 85%; object-fit: contain;
}
.no-img { color: var(--muted); font-size: .78rem; }
.product-tags { position: absolute; top: 8px; left: 8px; display: flex; flex-direction: column; gap: 3px; }
.tag {
  font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 3px;
  text-transform: uppercase; letter-spacing: .3px;
}
.tag-sale { background: var(--sale); color: #fff; }
.tag-edlp { background: var(--edlp); color: #fff; }
.tag-clearance { background: var(--clearance); color: #fff; }
.tag-new { background: var(--new); color: #fff; }
.product-body { padding: 12px 14px; flex: 1; display: flex; flex-direction: column; gap: 5px; }
.product-name {
  font-size: .8rem; font-weight: 600; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  color: var(--text);
}
.product-price-row { display: flex; align-items: baseline; gap: 8px; margin-top: auto; }
.price { font-size: .95rem; font-weight: 700; color: var(--accent); }
.old-price { font-size: .75rem; color: #999; text-decoration: line-through; }

/* ─── Material Badge ─── */
.mat-badge {
  display: inline-block; padding: 2px 7px; border-radius: 3px; font-size: .62rem;
  font-weight: 600; text-transform: uppercase; letter-spacing: .04em; align-self: flex-start;
}
.mat-glass { background: #d4ebf2; color: #3d7585; }
.mat-ceramic { background: #f2e4d4; color: #8c6d4a; }
.mat-polyresin { background: #e6e0f2; color: #6b5c8c; }
.mat-metal { background: #e8e8e8; color: #6b6b6b; }
.mat-wood { background: #e2edda; color: #5c7a44; }
.mat-natural { background: #efeadb; color: #8a7a5a; }
.mat-plastic { background: #fdf0dd; color: #a87a3a; }

/* ─── Bar Charts ─── */
.bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.bar-label { width: 90px; text-align: right; font-size: .82rem; font-weight: 500; color: #5c5650; flex-shrink: 0; }
.bar-track { flex: 1; height: 22px; background: #eeebe5; border-radius: 6px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent); border-radius: 6px; min-width: 3px; transition: width .4s ease; }
.bar-fill.bar-glass { background: var(--glass); }
.bar-fill.bar-ceramic { background: var(--ceramic); }
.bar-fill.bar-polyresin { background: var(--polyresin); }
.bar-fill.bar-metal { background: var(--metal); }
.bar-fill.bar-wood { background: var(--wood); }
.bar-fill.bar-natural { background: var(--natural); }
.bar-fill.bar-plastic { background: var(--plastic); }
.bar-value { font-size: .8rem; color: var(--muted); white-space: nowrap; }
.bar-pct { font-size: .72rem; opacity: .6; }

/* ─── Category Section ─── */
.category-section { margin-bottom: 36px; }
.category-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #eae5de;
  flex-wrap: wrap; gap: 8px;
}
.category-header h3 { font-family: 'DM Serif Display', serif; font-size: 1.1rem; font-weight: 400; color: var(--text); }
.category-stats { font-size: .8rem; color: var(--muted); }

/* ─── Legend ─── */
.legend { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; font-size: .78rem; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-item i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

/* ─── Opportunity Cards ─── */
.opp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
.opp-card {
  background: var(--card); border-radius: var(--radius); padding: 18px;
  box-shadow: var(--shadow); border-left: 4px solid var(--accent);
}
.opp-card.opp-high { border-left-color: var(--sale); }
.opp-card.opp-medium { border-left-color: var(--warm); }
.opp-card h4 { font-size: .9rem; font-weight: 600; margin-bottom: 6px; }
.opp-card p { font-size: .8rem; color: var(--muted); line-height: 1.5; }
.opp-type { font-size: .65rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin-bottom: 4px; }

/* ─── Diff Section ─── */
.diff-section { margin-top: 20px; }
.diff-section h4 { font-size: .9rem; margin-bottom: 10px; font-weight: 600; }
.diff-new { color: var(--new); }
.diff-removed { color: var(--sale); }
.diff-price { color: var(--edlp); }
.diff-list { display: flex; flex-wrap: wrap; gap: 6px; }
.diff-chip {
  display: inline-block; padding: 5px 10px; border-radius: 6px; font-size: .78rem;
  background: #faf9f7; border: 1px solid #f0ede8;
}
.chip-new { border-left: 3px solid var(--new); }
.chip-removed { border-left: 3px solid var(--sale); color: var(--muted); text-decoration: line-through; text-decoration-color: rgba(212,73,62,.2); }
.chip-up { border-left: 3px solid var(--sale); }
.chip-down { border-left: 3px solid var(--new); }

/* ─── Footer ─── */
.footer {
  text-align: center; padding: 32px 0; margin-top: 40px;
  border-top: 1px solid rgba(107,79,60,.08); color: var(--muted); font-size: .75rem;
}
.footer a { color: var(--muted); }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .hero { padding: 36px 0 32px; }
  .hero-stats { gap: 20px; }
  .hero-stat h3 { font-size: 1.4rem; }
  .product-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .bar-label { width: 65px; font-size: .75rem; }
}
@media (max-width: 480px) {
  .container { padding: 0 12px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .product-img { height: 150px; }
}
</style>
</head>
<body>

<div class="hero">
  <div class="container hero-inner">
    <div class="hero-label">Market Intelligence · ${today} · ${weekNum}</div>
    <h1>${esc(config.name)} — <em>${esc(targetLabel)}</em></h1>
    <p>Product &amp; pricing intelligence extracted from ${esc(config.baseUrl)}. Updated weekly with change detection.</p>
    <div class="hero-stats">
      <div class="hero-stat"><h3>${overview.totalSkus || products.length}</h3><p>Total SKUs</p></div>
      <div class="hero-stat"><h3>${currencySymbol}${overview.avgPrice || priceAnalysis.overallAvg || '—'}</h3><p>Average Price</p></div>
      <div class="hero-stat"><h3>${Object.keys(byCategory).length}</h3><p>Categories</p></div>
      <div class="hero-stat"><h3>${materialEntries.length}</h3><p>Materials</p></div>
      ${diffData && !diffData.isBaseline ? `<div class="hero-stat"><h3 style="color:${diffData.summary.added > 0 ? '#7d9b6a' : 'rgba(255,255,255,.5)'}">${diffData.summary.added > 0 ? '+' + diffData.summary.added : '0'}</h3><p>New This Week</p></div>` : ''}
    </div>
    <div class="hero-meta">${rawData.scrapedAt ? 'Data: ' + rawData.scrapedAt.slice(0, 10) : ''} · ${config.baseUrl} · customer-analysis v1.0</div>
  </div>
</div>

<div class="container">

<div class="kpi-row">
  <div class="kpi"><span class="val">${overview.totalSkus || products.length}</span><span class="lbl">Total SKUs</span></div>
  <div class="kpi"><span class="val">${Object.keys(byCategory).length}</span><span class="lbl">Categories</span></div>
  <div class="kpi"><span class="val">${currencySymbol}${overview.avgPrice || priceAnalysis.overallAvg || '—'}</span><span class="lbl">Avg Price</span></div>
  <div class="kpi"><span class="val">${overview.onSalePct || discountAnalysis.onSalePct || '—'}%</span><span class="lbl">On Sale</span></div>
  <div class="kpi"><span class="val">${overview.newCount || discountAnalysis.newProductCount || 0}</span><span class="lbl">New</span></div>
</div>

${diffHtml}

<section class="section">
  <h2>Price Band Distribution</h2>
  <p class="section-sub">${priceAnalysis.totalPriced || products.length} priced products · average ${currencySymbol}${priceAnalysis.overallAvg || overview.avgPrice || '—'}</p>
  ${priceBandBars}
</section>

${materialEntries.length > 0 ? `
<section class="section">
  <h2>Material Distribution</h2>
  ${legendItems ? `<div class="legend">${legendItems}</div>` : ''}
  ${materialBars}
</section>` : ''}

${oppHtml}

<section class="section">
  <h2>Products by Category</h2>
  ${allMats.length > 0 ? `
  <div class="filter-bar">
    <button class="filter-btn all active" onclick="filterAll()">All</button>
    ${matFilterBtns}
  </div>` : ''}
  ${categorySections}
</section>

</div>

<footer class="footer">
  <div class="container">
    <p>Data source: ${esc(config.baseUrl)} · Generated ${today} · customer-analysis v1.0</p>
    <p style="margin-top:4px;">HER System · Market Intelligence · For internal analysis only</p>
  </div>
</footer>

<script>
// Material filter functionality
document.querySelectorAll('.mat-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    const mat = btn.dataset.mat;
    const isActive = btn.classList.contains('active');

    // Deactivate all
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn.all').classList.add('active');

    if (!isActive) {
      // Filter: show only this material
      btn.classList.add('active');
      document.querySelector('.filter-btn.all').classList.remove('active');
      document.querySelectorAll('.product-card').forEach(card => {
        card.classList.toggle('hidden', card.dataset.mat !== mat);
      });
    } else {
      // Unfilter: show all
      filterAll();
    }
  });
});

function filterAll() {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn.all').classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => card.classList.remove('hidden'));
}
</script>

</body>
</html>`;

  // Save
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = resolve(OUTPUT_DIR, `${customerId}_${targetId}_dashboard.html`);
  writeFileSync(outPath, html);
  console.log(`\n✅ Dashboard saved to ${outPath}`);
  console.log(`   Open: file:///${outPath.replace(/\\/g, '/')}`);

  return outPath;
}

// Run as standalone
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customerId = process.argv[2] || 'jysk';
  const targetId = process.argv[3] || 'bathroom';
  const config = loadConfig(customerId);
  generateDashboard(config, targetId);
}
