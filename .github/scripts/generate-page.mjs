import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const DATA_DIR = '_data';
const OUT_DIR = '_site';

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Load scraped data
function loadJSON(file) {
  const path = `${DATA_DIR}/${file}`;
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return [];
  }
}

const drinking = loadJSON('drinking.json');
const plates = loadJSON('plates.json');
const accessories = loadJSON('accessories.json');

// Build lookup maps for images
const imgMap = {};
[...drinking, ...plates, ...accessories].forEach(p => {
  if (p.i && p.n) imgMap[p.n.trim()] = p.i;
});

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

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JYSK 餐具销售机会分析 · ${today}</title>
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
  .hero-stats { display: flex; gap: 48px; margin-top: 48px; padding-top: 40px; border-top: 1px solid rgba(107,79,60,0.12); }
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
    transition: transform 0.2s ease;
  }
  .product-item .pthumb:hover { transform: scale(2.5); z-index: 10; box-shadow: 0 4px 16px rgba(44,44,44,0.15); }
  .product-item .info { flex: 1; min-width: 0; }
  .product-item .name { font-size: 0.85rem; font-weight: 500; color: var(--charcoal); line-height: 1.4; }
  .product-item .series { font-size: 0.7rem; color: rgba(44,44,44,0.35); letter-spacing: 0.05em; margin-top: 2px; }
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
    .hero-stats { flex-wrap: wrap; gap: 24px; }
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
    <h1>JYSK 餐具<br><em>销售机会分析</em></h1>
    <p>基于 JYSK UK 官网 Kitchen 品类实时数据的竞争格局与增长机会研究。每周五自动更新。</p>
    <div class="hero-stats">
      <div class="hero-stat"><h3>${drinking.length + plates.length + accessories.length}</h3><p>SKU</p></div>
      <div class="hero-stat"><h3>£1.25 – £17.50</h3><p>价格带</p></div>
      <div class="hero-stat"><h3>3</h3><p>子品类</p></div>
      <div class="hero-stat"><h3>${weekNum}</h3><p>本周</p></div>
    </div>
    <div class="update-badge">⏰ 自动更新 · 每周五 14:00 BST</div>
  </div>
</section>

<div class="container">

<section class="section">
  <div class="section-header">
    <div class="section-number">01</div>
    <h2>品类总览</h2>
    <p>JYSK UK 厨房餐具分为三大子品类，覆盖从日常饮用、餐桌摆盘到厨房收纳的全场景。</p>
  </div>
  <div class="category-grid">
    <div class="category-card">
      <h3>Drinking Glasses &amp; Mugs</h3>
      <div class="subtitle">玻璃杯 · 马克杯 · 咖啡杯</div>
      <div class="price-range">£1.50 – £9.00</div>
      <div class="count">${drinking.length} 款产品</div>
    </div>
    <div class="category-card">
      <h3>Plates, Bowls &amp; Cutlery</h3>
      <div class="subtitle">盘 · 碗 · 餐具套装</div>
      <div class="price-range">£1.25 – £17.50</div>
      <div class="count">${plates.length} 款产品</div>
    </div>
    <div class="category-card">
      <h3>Kitchen Accessories</h3>
      <div class="subtitle">配件 · 收纳 · 工具</div>
      <div class="price-range">£2.50 – £11.00</div>
      <div class="count">${accessories.length} 款产品</div>
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
  </div>
</footer>

</body>
</html>`;

writeFileSync(`${OUT_DIR}/index.html`, html, 'utf-8');
console.log(`✅ Page generated: ${OUT_DIR}/index.html (${drinking.length + plates.length + accessories.length} products)`);
