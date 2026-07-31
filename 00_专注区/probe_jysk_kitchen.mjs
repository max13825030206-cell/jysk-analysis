const sites = [
  { country: 'Albania', url: 'https://jysk.al' },
  { country: 'Azerbaijan', url: 'https://jysk.az' },
  { country: 'Estonia', url: 'https://www.jysk.ee' },
  { country: 'Georgia', url: 'https://jysk.ge' },
  { country: 'Iceland', url: 'https://www.rumfatalagerinn.is' },
  { country: 'Kuwait', url: 'https://jysk.com.kw' },
  { country: 'Lithuania', url: 'https://www.jysk.lt' },
  { country: 'Moldova', url: 'https://jysk.md' },
  { country: 'North Macedonia', url: 'https://jysk.mk' },
  { country: 'Uruguay', url: 'https://www.jysk.uy' },
  { country: 'Armenia', url: 'https://www.jysk.am' },
  { country: 'Canada', url: 'https://www.jysk.ca' },
  { country: 'Faroe Islands', url: 'https://jysk.fo' },
  { country: 'Greenland', url: 'https://www.pisiffik.gl/da' },
  { country: 'Kosovo', url: 'https://jysk-ks.com' },
  { country: 'Latvia', url: 'https://www.jysk.lv' },
  { country: 'Malta', url: 'https://jysk.com.mt' },
  { country: 'Montenegro', url: 'https://www.jysk.me' },
  { country: 'Tajikistan', url: 'https://jysk.tj' },
  { country: 'Vietnam', url: 'https://jysk.vn' }
];

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9'
};

const kitchenKeywords = [
  'kitchen', 'cuisine', 'kokken', 'küche', 'kuche', 'kuchyn', 'konyha', 'kuchnia', 'keuken', 'cocina', 'cozinha',
  'cucina', 'kuhinja', 'mutfak', 'virtuve', 'virtuve', 'daile', 'kitchen accessories', 'tableware', 'drinking',
  'mug', 'mugs', 'cup', 'cups', 'glass', 'glasses', 'krus', 'krusy', 'tasse', 'tasses', 'tassen', 'glas', 'glaser',
  'verre', 'verres', 'muggar', 'krus', 'bowl', 'bowls', 'plate', 'plates', 'cutlery', 'table linen'
];

function includesKitchenText(text = '') {
  const value = text.toLowerCase();
  return kitchenKeywords.some((keyword) => value.includes(keyword));
}

async function fetchJson(url) {
  const response = await fetch(url, { headers, redirect: 'follow' });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return {
    ok: response.ok,
    status: response.status,
    url: response.url,
    text,
    json,
    contentType: response.headers.get('content-type') || ''
  };
}

function simplifyCategories(categories = []) {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parent: category.parent,
    count: category.count,
    permalink: category.permalink,
    description: category.description
  }));
}

function traceCategoryChain(category, allById) {
  const chain = [];
  let current = category;
  let guard = 0;
  while (current && guard < 10) {
    chain.unshift(current.name);
    current = allById.get(current.parent);
    guard += 1;
  }
  return chain;
}

async function probeSite(site) {
  const result = {
    country: site.country,
    baseUrl: site.url,
    wpJson: null,
    categoryApi: null,
    productApi: null,
    categoryCount: 0,
    kitchenCandidates: [],
    error: null
  };

  try {
    const wp = await fetchJson(`${site.url.replace(/\/$/, '')}/wp-json/`);
    result.wpJson = { ok: wp.ok, status: wp.status, finalUrl: wp.url, contentType: wp.contentType };

    if (!wp.ok || !wp.text.includes('wc/store')) {
      return result;
    }

    const cat = await fetchJson(`${site.url.replace(/\/$/, '')}/wp-json/wc/store/v1/products/categories?per_page=200`);
    result.categoryApi = { ok: cat.ok, status: cat.status, finalUrl: cat.url, contentType: cat.contentType };
    if (!cat.ok || !Array.isArray(cat.json)) {
      return result;
    }

    const categories = simplifyCategories(cat.json);
    result.categoryCount = categories.length;
    const allById = new Map(categories.map((item) => [item.id, item]));

    const kitchenCandidates = categories
      .map((category) => ({
        ...category,
        chain: traceCategoryChain(category, allById)
      }))
      .filter((category) => {
        const joined = `${category.name} ${category.slug} ${category.description || ''} ${category.chain.join(' > ')}`;
        return includesKitchenText(joined);
      })
      .map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category.count,
        chain: category.chain,
        permalink: category.permalink
      }));

    result.kitchenCandidates = kitchenCandidates;

    if (kitchenCandidates.length) {
      const first = kitchenCandidates[0];
      const products = await fetchJson(`${site.url.replace(/\/$/, '')}/wp-json/wc/store/v1/products?category=${first.id}&per_page=3`);
      result.productApi = { ok: products.ok, status: products.status, finalUrl: products.url, contentType: products.contentType };
      if (Array.isArray(products.json)) {
        result.productSample = products.json.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.prices?.price,
          currency: item.prices?.currency_code,
          categories: item.categories?.map((cat) => cat.name) || []
        }));
      }
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

const results = [];
for (const site of sites) {
  results.push(await probeSite(site));
}

console.log(JSON.stringify(results, null, 2));
