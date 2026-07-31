import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const DATA_DIR = '_data';
const PREV_DIR = '_data_prev';
const OUT_DIR = '_site';

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Load scraped data
function loadJSON(file) {
  const path = `${DATA_DIR}/${file}`;
  if (!existsSync(path)) return [];
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return []; }
}
function loadPrevJSON(file) {
  const path = `${PREV_DIR}/${file}`;
  if (!existsSync(path)) return [];
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return []; }
}

const drinking = loadJSON('drinking.json');
const plates = loadJSON('plates.json');
const accessories = loadJSON('accessories.json');

const prevDrinking = loadPrevJSON('drinking.json');
const prevPlates = loadPrevJSON('plates.json');
const prevAccessories = loadPrevJSON('accessories.json');

// Read prev date
let prevDate = '';
const datePath = `${PREV_DIR}/scrape-date.txt`;
if (existsSync(datePath)) {
  prevDate = readFileSync(datePath, 'utf-8').trim();
}

const allCurrent = [...drinking, ...plates, ...accessories];
const allPrev = [...prevDrinking, ...prevPlates, ...prevAccessories];

// Build lookup maps
const imgMap = {};
allCurrent.forEach(p => { if (p.i && p.n) imgMap[p.n.trim()] = p.i; });

function normalizeName(name) {
  return name.replace(/EVERYDAY LOW PRICE|New|-\d+%|While stocks last/g, '').trim().toLowerCase();
}
function extractPrice(text) {
  const m = text.match(/£[\d.]+/);
  return m ? parseFloat(m[0].replace('£','')) : null;
}

// Build comparison maps
const prevMap = {};
allPrev.forEach(p => {
  const key = normalizeName(p.n);
  prevMap[key] = { price: extractPrice(p.p), raw: p };
});
const currMap = {};
allCurrent.forEach(p => {
  const key = normalizeName(p.n);
  currMap[key] = { price: extractPrice(p.p), raw: p };
});

// Compute diffs
const newProducts = [];
const removedProducts = [];
const priceChanges = [];

for (const [key, curr] of Object.entries(currMap)) {
  if (!prevMap[key]) {
    newProducts.push({ name: key, price: curr.price, raw: curr.raw });
  } else if (prevMap[key].price !== null && curr.price !== null && prevMap[key].price !== curr.price) {
    priceChanges.push({
      name: key,
      oldPrice: prevMap[key].price,
      newPrice: curr.price,
      raw: curr.raw
    });
  }
}
for (const [key, prev] of Object.entries(prevMap)) {
  if (!currMap[key]) {
    removedProducts.push({ name: key, price: prev.price });
  }
}

// --- Helper: product count diff bar ---
function countDiff(current, previous, label) {
  const delta = current - previous;
  const hasPrev = previous > 0;
  if (!hasPrev) return `<span style="color:rgba(44,44,44,0.4);">${current} SKU (首次)</span>`;
  if (delta === 0) return `<span style="color:rgba(44,44,44,0.4);">${current} SKU (不变)</span>`;
  const sign = delta > 0 ? '+' : '';
  const color = delta > 0 ? 'var(--tag-new)' : '#c4704a';
  return `${current} SKU <span style="color:${color};font-weight:600;">(${sign}${delta})</span>`;
}

// --- Build HTML ---
const weekNum = getWeekNumber(new Date());
const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const y = d.getUTCFullYear();
  const z = new Date(Date.UTC(y, 0, 1));
  const w = Math.ceil((((d - z) / 86400000) + z.getUTCDay() + 1) / 7);
  return `W${w}`;
}

function imgTag(name) {
  const src = imgMap[name.trim()];
  return src ? `<img class="pthumb" src="${src}" alt="" loading="lazy">` : '';
}

function buildProductHTML(items, filterFn) {
  return items.filter(filterFn).map(p => {
    const hasSale = p.p.includes('/each') && p.p.includes('£') && (p.p.match(/£/g) || []).length > 1;
    const prices = p.p.match(/£[\d.]+/g) || [];
    const current = prices[0] || '';
    const old = prices[1] ? `<span class="old">${prices[1]}</span>` : '';
    const isEdlp = p.p.includes('EVERYDAY') || p.p.includes('Now even');
    const isSale = hasSale;
    const isLast = p.p.includes('While stocks') || p.p.includes('last');
    let tags = '';
    if (isEdlp) tags += '<span class="tag tag-edlp">EDLP</span>';
    if (isSale) tags += '<span class="tag tag-sale">Sale</span>';
    if (isLast) tags += '<span class="tag tag-last">清仓</span>';
    const name = p.n.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/([a-z])([A-Z])/g, '$1 $2');
    return `<div class="product-item">${imgTag(p.n)}<div class="info"><div class="name">${name}</div>${tags ? `<div class="tags">${tags}</div>` : ''}</div><div class="price">${current} ${old}</div></div>`;
  }).join('\n    ');
}

// --- Weekly Changes Section ---
let changesHTML = '';
const hasPrev = prevDrinking.length > 0 || prevPlates.length > 0 || prevAccessories.length > 0;

if (hasPrev) {
  changesHTML = `
  <section class="section">
    <div class="section-header">
      <div class="section-number">📊</div>
      <h2>Weekly Changes</h2>
      <p>对比 ${prevDate} → ${today} 的变化。绿色 = 新增，红色 = 下架，蓝色 = 价格变动。</p>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:32px;">
      <div style="background:var(--warm-white);border-radius:14px;padding:22px;text-align:center;border-top:3px solid var(--tag-new);">
        <div style="font-size:2rem;font-weight:700;color:var(--tag-new);">+${newProducts.length}</div>
        <div style="font-size:0.8rem;color:rgba(44,44,44,0.5);margin-top:4px;">新增产品</div>
      </div>
      <div style="background:var(--warm-white);border-radius:14px;padding:22px;text-align:center;border-top:3px solid #c4704a;">
        <div style="font-size:2rem;font-weight:700;color:#c4704a;">-${removedProducts.length}</div>
        <div style="font-size:0.8rem;color:rgba(44,44,44,0.5);margin-top:4px;">下架产品</div>
      </div>
      <div style="background:var(--warm-white);border-radius:14px;padding:22px;text-align:center;border-top:3px solid var(--tag-edlp);">
        <div style="font-size:2rem;font-weight:700;color:var(--tag-edlp);">${priceChanges.length}</div>
        <div style="font-size:0.8rem;color:rgba(44,44,44,0.5);margin-top:4px;">价格变动</div>
      </div>
    </div>`;

  if (newProducts.length > 0) {
    changesHTML += `
    <div style="margin-bottom:24px;">
      <h4 style="color:var(--tag-new);margin-bottom:12px;">🆕 新增 (${newProducts.length})</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${newProducts.map(p => `<span style="font-size:0.8rem;padding:6px 12px;background:rgba(125,155,106,0.08);border-radius:8px;color:var(--tag-new);">${p.name} ${p.price !== null ? '· £'+p.price.toFixed(2) : ''}</span>`).join('')}
      </div>
    </div>`;
  }

  if (removedProducts.length > 0) {
    changesHTML += `
    <div style="margin-bottom:24px;">
      <h4 style="color:#c4704a;margin-bottom:12px;">🗑️ 下架 (${removedProducts.length})</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${removedProducts.map(p => `<span style="font-size:0.8rem;padding:6px 12px;background:rgba(196,112,74,0.06);border-radius:8px;color:#c4704a;text-decoration:line-through;text-decoration-color:rgba(196,112,74,0.2);">${p.name}</span>`).join('')}
      </div>
    </div>`;
  }

  if (priceChanges.length > 0) {
    changesHTML += `
    <div>
      <h4 style="color:var(--tag-edlp);margin-bottom:12px;">💰 价格变动 (${priceChanges.length})</h4>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${priceChanges.map(p => {
          const diff = p.newPrice - p.oldPrice;
          const sign = diff > 0 ? '+' : '';
          const color = diff > 0 ? '#c4704a' : 'var(--tag-new)';
          return `<div style="display:flex;align-items:center;gap:12px;font-size:0.82rem;padding:8px 12px;background:var(--warm-white);border-radius:8px;">
            <span style="color:var(--charcoal);font-weight:500;">${p.name}</span>
            <span style="color:rgba(44,44,44,0.35);text-decoration:line-through;">£${p.oldPrice.toFixed(2)}</span>
            <span style="color:rgba(44,44,44,0.35);">→</span>
            <span style="color:${color};font-weight:600;">£${p.newPrice.toFixed(2)}</span>
            <span style="font-size:0.7rem;color:${color};">(${sign}£${Math.abs(diff).toFixed(2)})</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  if (newProducts.length === 0 && removedProducts.length === 0 && priceChanges.length === 0) {
    changesHTML += `<div style="text-align:center;padding:40px;color:rgba(44,44,44,0.35);">✅ 本周无变化 — 产品线与上周完全一致</div>`;
  }

  changesHTML += `</section>`;
}

// --- Full HTML ---
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JYSK 餐具数据看板 · ${today}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  :root {
    --sand: #f5efe6; --clay: #c4a882; --sage: #9aab8e;
    --dusty-grape: #8b7d8c; --pale-khaki: #c9c0a8;
    --brown: #6b4f3c; --charcoal: #2c2c2c;
    --cream: #faf7f0; --warm-white: #fdfcfa;
    --muted-gold: #baa67e; --light-clay: #e8ddd0;
    --tag-new: #7d9b6a; --tag-sale: #c4704a; --tag-edlp: #5b7a9e;
    --bg-dot: rgba(154,171,142,0.08);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Sans SC', -apple-system, sans-serif;
    background: var(--cream); color: var(--charcoal);
    line-height: 1.6; overflow-x: hidden;
  }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }

  /* Hero */
  .hero {
    padding: 100px 40px 80px;
    background: linear-gradient(165deg, #f5efe6 0%, #e8ddd0 40%, #d9cfc0 100%);
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 600px 300px at 10% 20%, rgba(154,171,142,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 500px 400px at 90% 60%, rgba(139,125,140,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
  .hero-label { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--brown); opacity: 0.6; margin-bottom: 20px; font-weight: 500; }
  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    line-height: 1.1; color: var(--charcoal);
    max-width: 700px; margin-bottom: 16px; font-weight: 400;
  }
  .hero h1 em { font-style: italic; color: var(--brown); }
  .hero p { font-size: 1.05rem; color: rgba(44,44,44,0.7); max-width: 560px; font-weight: 300; line-height: 1.8; }
  .hero-stats { display: flex; gap: 48px; margin-top: 48px; padding-top: 40px; border-top: 1px solid rgba(107,79,60,0.12); flex-wrap: wrap; }
  .hero-stat h3 { font-family: 'DM Serif Display', serif; font-size: 2rem; color: var(--charcoal); }
  .hero-stat p { font-size: 0.8rem; color: rgba(44,44,44,0.5); letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }

  .section { padding: 80px 0; border-bottom: 1px solid rgba(107,79,60,0.08); }
  .section:last-of-type { border-bottom: none; }
  .section-header { margin-bottom: 48px; }
  .section-number { font-size: 0.7rem; letter-spacing: 0.15em; color: var(--brown); opacity: 0.5; font-weight: 500; margin-bottom: 8px; }
  .section h2 { font-family: 'DM Serif Display', serif; font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 400; color: var(--charcoal); margin-bottom: 12px; }
  .section h2 + p { color: rgba(44,44,44,0.6); font-weight: 300; max-width: 600px; }

  .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
  .category-card {
    background: var(--warm-white); border-radius: 16px; padding: 32px;
    transition: transform 0.3s ease, box-shadow 0.3s ease; position: relative; overflow: hidden;
  }
  .category-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  .category-card:nth-child(1)::before { background: var(--muted-gold); }
  .category-card:nth-child(2)::before { background: var(--sage); }
  .category-card:nth-child(3)::before { background: var(--dusty-grape); }
  .category-card h3 { font-family: 'DM Serif Display', serif; font-size: 1.3rem; font-weight: 400; margin-bottom: 4px; }
  .category-card .subtitle { font-size: 0.8rem; color: rgba(44,44,44,0.4); margin-bottom: 20px; }
  .category-card .price-range { font-size: 0.85rem; color: var(--brown); margin-bottom: 16px; font-weight: 500; }
  .category-card .count { font-size: 0.8rem; color: rgba(44,44,44,0.5); }

  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
  .product-item {
    display: flex; align-items: center; padding: 10px 14px;
    background: var(--warm-white); border-radius: 10px; gap: 12px; transition: background 0.2s;
  }
  .product-item:hover { background: var(--light-clay); }
  .product-item .pthumb {
    width: 44px; height: 44px; border-radius: 6px; object-fit: cover;
    background: var(--cream); flex-shrink: 0; border: 1px solid rgba(44,44,44,0.05);
  }
  .product-item .info { flex: 1; min-width: 0; }
  .product-item .name { font-size: 0.85rem; font-weight: 500; color: var(--charcoal); line-height: 1.4; }
  .product-item .price { font-size: 0.9rem; font-weight: 500; color: var(--brown); white-space: nowrap; text-align: right; flex-shrink: 0; }
  .product-item .price .old { font-size: 0.75rem; color: rgba(44,44,44,0.35); text-decoration: line-through; font-weight: 400; margin-left: 6px; }
  .product-item .tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
  .product-item .tag { font-size: 0.6rem; padding: 2px 8px; border-radius: 4px; font-weight: 500; letter-spacing: 0.03em; }
  .tag-edlp { background: rgba(91,122,158,0.1); color: var(--tag-edlp); }
  .tag-sale { background: rgba(196,112,74,0.12); color: var(--tag-sale); }
  .tag-last { background: rgba(196,112,74,0.08); color: var(--tag-sale); }

  .update-badge {
    display: inline-block; font-size: 0.72rem; padding: 4px 12px;
    border-radius: 20px; background: rgba(154,171,142,0.12); color: var(--tag-new);
    margin-top: 16px; letter-spacing: 0.03em;
  }

  .footer { padding: 40px 0; text-align: center; font-size: 0.75rem; color: rgba(44,44,44,0.3); border-top: 1px solid rgba(107,79,60,0.06); }

  @media (max-width: 900px) {
    .category-grid { grid-template-columns: 1fr; }
    .hero { padding: 60px 24px 50px; }
    .container { padding: 0 24px; }
    .section { padding: 50px 0; }
  }
  @media (max-width: 600px) {
    .product-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<section class="hero">
  <div class="hero-inner">
    <div class="hero-label">Market Intelligence · Updated ${today} · ${weekNum}</div>
    <h1>JYSK 餐具<br><em>数据看板</em></h1>
    <p>基于 JYSK UK 官网 Kitchen 品类实时数据的每周追踪。每周五自动更新，对比展示新增、下架与价格变动。</p>
    <div class="hero-stats">
      <div class="hero-stat"><h3>${drinking.length + plates.length + accessories.length}</h3><p>当前 SKU</p></div>
      <div class="hero-stat"><h3>£${minPrice(allCurrent)} – £${maxPrice(allCurrent)}</h3><p>价格带</p></div>
      <div class="hero-stat"><h3>3</h3><p>子品类</p></div>
      <div class="hero-stat"><h3>${weekNum}</h3><p>本周</p></div>
      ${hasPrev ? `<div class="hero-stat"><h3 style="color:${newProducts.length>0?'var(--tag-new)':'rgba(44,44,44,0.3)'}">${newProducts.length>0?'+'+newProducts.length:'0'}</h3><p>本周新增</p></div>` : ''}
    </div>
    <div class="update-badge">⏰ 自动更新 · 每周五 14:00 CST</div>
  </div>
</section>

<div class="container">

${changesHTML}

<section class="section">
  <div class="section-header">
    <div class="section-number">01</div>
    <h2>品类总览</h2>
    <p>JYSK UK 厨房餐具分为三大子品类，覆盖从日常饮用、餐桌摆盘到厨房收纳的全场景。数据更新于 ${today}。</p>
  </div>
  <div class="category-grid">
    <div class="category-card">
      <h3>Drinking Glasses &amp; Mugs</h3>
      <div class="subtitle">玻璃杯 · 马克杯 · 咖啡杯</div>
      <div class="price-range">£${minPrice(drinking)} – £${maxPrice(drinking)}</div>
      <div class="count">${countDiff(drinking.length, prevDrinking.length, '款产品')}</div>
    </div>
    <div class="category-card">
      <h3>Plates, Bowls &amp; Cutlery</h3>
      <div class="subtitle">盘 · 碗 · 餐具套装</div>
      <div class="price-range">£${minPrice(plates)} – £${maxPrice(plates)}</div>
      <div class="count">${countDiff(plates.length, prevPlates.length, '款产品')}</div>
    </div>
    <div class="category-card">
      <h3>Kitchen Accessories</h3>
      <div class="subtitle">配件 · 收纳 · 工具</div>
      <div class="price-range">£${minPrice(accessories)} – £${maxPrice(accessories)}</div>
      <div class="count">${countDiff(accessories.length, prevAccessories.length, '款产品')}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-header">
    <div class="section-number">02</div>
    <h2>全产品清单</h2>
    <p>自动从 JYSK UK 官网抓取，含价格与促销标识。数据更新于 ${today}。</p>
  </div>

  <h3 style="font-family:'DM Serif Display',serif;font-weight:400;font-size:1.2rem;margin-bottom:20px;color:var(--brown);">🥂 Drinking Glasses &amp; Mugs</h3>
  <div class="product-grid">
    ${buildProductHTML(drinking, () => true)}
  </div>

  <h3 style="font-family:'DM Serif Display',serif;font-weight:400;font-size:1.2rem;margin:40px 0 20px;color:var(--brown);">🍽️ Plates, Bowls &amp; Cutlery</h3>
  <div class="product-grid">
    ${buildProductHTML(plates, () => true)}
  </div>

  <h3 style="font-family:'DM Serif Display',serif;font-weight:400;font-size:1.2rem;margin:40px 0 20px;color:var(--brown);">🔪 Kitchen Accessories</h3>
  <div class="product-grid">
    ${buildProductHTML(accessories, () => true)}
  </div>
</section>

</div>

<footer class="footer">
  <div class="container">
    <p>数据来源：JYSK UK 官网 · 每周五自动更新 · 分析仅供内部参考</p>
    <p style="margin-top:4px;">HER System × 小熊 · JYSK Kitchen Market Intelligence</p>
    ${prevDate ? `<p style="margin-top:4px;">上次数据：${prevDate} → 本次：${today}</p>` : ''}
    <p style="margin-top:8px;"><a href="/_archive/" style="color:rgba(44,44,44,0.4);text-decoration:underline;">📦 查看历史数据</a></p>
  </div>
</footer>

</body>
</html>`;

writeFileSync(`${OUT_DIR}/index.html`, html, 'utf-8');
console.log(`✅ Page generated: ${OUT_DIR}/index.html (${allCurrent.length} products, ${newProducts.length} new, ${removedProducts.length} removed, ${priceChanges.length} price changes)`);

// === Helpers ===
function minPrice(items) {
  if (!items.length) return '—';
  let min = Infinity;
  items.forEach(p => {
    const m = p.p.match(/£[\d.]+/g);
    if (m) m.forEach(v => { const n = parseFloat(v.replace('£','')); if (n < min) min = n; });
  });
  return min === Infinity ? '—' : min.toFixed(2);
}
function maxPrice(items) {
  if (!items.length) return '—';
  let max = -Infinity;
  items.forEach(p => {
    const m = p.p.match(/£[\d.]+/g);
    if (m) m.forEach(v => { const n = parseFloat(v.replace('£','')); if (n > max) max = n; });
  });
  return max === Infinity ? '—' : max.toFixed(2);
}
