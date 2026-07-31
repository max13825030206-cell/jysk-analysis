window.JYSK_KITCHEN_DATA = {
  meta: {
    title: "JYSK KITCHEN Franchise Market Atlas",
    subtitle: "20 官方加盟国店铺 · 公开网页证据版",
    lastUpdated: "2026-07-27",
    mode: "Official public-shop evidence only",
    caveat: "这页严格只用 JYSK 官方加盟国店铺公开页面。能稳定证明的是价格、类目、重复出现的产品家族和部分类目数量；不能稳定证明的是 20 国统一 SKU 总量、真实 best-seller 排名和 new-arrival 数。"
  },
  overviewCards: [
    {
      label: "Official source markets",
      value: "20",
      foot: "JYSK Franchise 官方列出的 20 个国家店铺全部逐一检查"
    },
    {
      label: "Price-verifiable markets",
      value: "11",
      foot: "能在本环境下直接验证到带价格 SKU 的市场"
    },
    {
      label: "Category-only markets",
      value: "4",
      foot: "只能确认 KITCHEN 类目树，商品级明细不稳定"
    },
    {
      label: "Blocked / insufficient",
      value: "5",
      foot: "Cloudflare / human verification / 无法稳定读到 KITCHEN 商品页"
    },
    {
      label: "Countable SKU floor",
      value: "241+",
      foot: "仅基于 Malta 与 Uruguay 公开类目计数，不外推其它市场"
    },
    {
      label: "Unified best-seller tags",
      value: "0/20",
      foot: "已验证来源里没有统一可复用的热卖标签体系"
    },
    {
      label: "Unified new-arrival tags",
      value: "0/20",
      foot: "已验证来源里没有统一可复用的上新标签体系"
    },
    {
      label: "Recurring kitchen clusters",
      value: "6",
      foot: "杯 / 玻璃器皿 / 盘碗 / 刀叉与上菜 / 厨房辅件 / 桌面纺织"
    }
  ],
  integrity: {
    canProve: [
      "20 个官方加盟国店铺里，哪些市场能机器读取、哪些被拦截。",
      "公开网页里反复出现的 KITCHEN 子品类：杯、玻璃杯、盘碗、刀叉、厨房辅件、桌布与茶巾。",
      "价格带明显偏 value-led，且多个市场重复出现同一产品家族：FERDINAND、DETMER、TORRE、BERTIL、GREGERS、OVE、JIMMI。",
      "Malta 与 Uruguay 能给出最稳的公开类目数量信号；Albania / North Macedonia 能给出促销标签数量信号。"
    ],
    cannotProve: [
      "所有 20 国的严格 SKU 总量与每个 SKU 的完整价格，因为 5 个市场被安全墙拦截，4 个市场只有类目树没有稳定商品流。",
      "真实 sell-out、best-seller 排名、new-arrival 数，因为官网公开页没有统一标签或销量字段。",
      "Greenland 的 Pisiffik 站点是官方来源，但它是 multi-concept，不是纯 JYSK 单品牌目录。"
    ]
  },
  marketCoverage: [
    {
      country: "Albania",
      site: "https://jysk.al",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.al/public/ck/gc/ea34eb9a-021c-11ef-9b4a-4787dd30571d/prd",
      categories: ["Kuzhinë", "Enë kuzhine", "Enë servimi", "Aksesorë kuzhine", "Pëlhura tryeze", "Peceta enësh"],
      countSignal: "Always low price (45) · Campaign (13)",
      note: "公开 SPA 类目和商品页可访问，已验证杯类 SKU 价格与规格。"
    },
    {
      country: "Azerbaijan",
      site: "https://jysk.az",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.az/az/category/metbex-otagi-145",
      categories: ["Mətbəx otağı"],
      countSignal: "Sitemap keyword hits · fincan 10 · stekan 7 · bosqab 22 · salfet 7 · termos 2",
      note: "官方 sitemap 可读，商品页价格与基础规格可验证。"
    },
    {
      country: "Estonia",
      site: "https://www.jysk.ee",
      status: "blocked",
      statusLabel: "Blocked",
      kitchenUrl: "https://www.jysk.ee",
      categories: [],
      countSignal: "Cloudflare blocked",
      note: "本环境被 Cloudflare 拦截，无法读到类目或商品页。"
    },
    {
      country: "Georgia",
      site: "https://jysk.ge",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.ge/sitemap.xml",
      categories: ["სასადილო", "საოჯახო აქსესუარები"],
      countSignal: "Public sitemap with categories + 5k+ product URLs",
      note: "公开 sitemap 与商品页都稳定，是结构最好的市场之一。"
    },
    {
      country: "Iceland",
      site: "https://www.jysk.is",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://www.jysk.is/smavara/eldhusvorur/",
      categories: ["Glös, bollar og flöskur", "Diskar og skálar", "Hnífapör, áhöld og bretti"],
      countSignal: "Category HTML readable · no unified numeric count",
      note: "HTTP 可读、浏览器自动化部分受限，但类目页商品卡与价格可取。"
    },
    {
      country: "Kuwait",
      site: "https://jysk.com.kw",
      status: "category",
      statusLabel: "Category-only",
      kitchenUrl: "https://jysk.com.kw/housewares-0/homeware-0/kitchenware-0.html",
      categories: ["Kitchenware", "Dinnerware & glassware"],
      countSignal: "Sitemap public · product pages gated by human verification",
      note: "能证明有 KITCHEN 树，但商品级抓取被 human verification 阻断。"
    },
    {
      country: "Lithuania",
      site: "https://www.jysk.lt",
      status: "blocked",
      statusLabel: "Blocked",
      kitchenUrl: "https://www.jysk.lt",
      categories: [],
      countSignal: "Cloudflare blocked",
      note: "主页、robots、sitemap 与 API 全被安全墙拦截。"
    },
    {
      country: "Moldova",
      site: "https://jysk.md",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.md/ro/category/buc-t-rie-145",
      categories: ["Bucătărie", "Veselă și tacâmuri"],
      countSignal: "Public sitemap with 3815 URLs · no stable category count",
      note: "商品页价格、描述与基础规格可验证。"
    },
    {
      country: "North Macedonia",
      site: "https://jysk.mk",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.mk/public/ck/gc/0463a7ae-021d-11ef-84b1-2f9d167bade1/prd",
      categories: ["Садови за кујна", "Прибор за сервирање", "Кујнски прибор"],
      countSignal: "Always low price (44) · Campaign (19)",
      note: "公开 SPA 结构可读，商品页价格与核心规格能验证。"
    },
    {
      country: "Uruguay",
      site: "https://www.jysk.uy",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://www.jysk.uy/hogar-y-decoracion/para-la-mesa",
      categories: ["Manteles", "Individuales", "Camineros", "Servilletas", "Vajilla", "Accesorios de cocina"],
      countSignal: "Subcategory counts sum to 76",
      note: "类目层公开数量最清晰，也是 KITCHEN 结构最完整的市场之一。"
    },
    {
      country: "Armenia",
      site: "https://www.jysk.am",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://www.jysk.am/hy/products/homeware_2525/kitchen_3260/",
      categories: ["Խոհանոց", "Մատուցման սպասք", "Խոհանոցային պարագաներ", "Խոհանոցային սրբիչներ"],
      countSignal: "Category proof only · no public numeric count",
      note: "公开 HTML 页稳定，可验证盘碗、杯类与玻璃器皿价格。"
    },
    {
      country: "Canada",
      site: "https://www.jysk.ca",
      status: "blocked",
      statusLabel: "Blocked",
      kitchenUrl: "https://www.jysk.ca",
      categories: [],
      countSignal: "HTTP 405",
      note: "主页与常见公开接口均返回 405，本环境无法提取公开商品数据。"
    },
    {
      country: "Faroe Islands",
      site: "https://jysk.fo",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.fo/smavorur/koksvorur/",
      categories: ["Køksvørur"],
      countSignal: "Category HTML paginated · no public numeric count",
      note: "公开 HTML 与产品卡可读，可验证杯、玻璃杯、盘碗价格。"
    },
    {
      country: "Greenland",
      site: "https://www.pisiffik.gl/da",
      status: "mixed",
      statusLabel: "Mixed concept",
      kitchenUrl: "https://www.pisiffik.gl/da/content/196-sitemap",
      categories: ["vandglas", "krus", "kopper", "bestiksæt", "køkkenartikler"],
      countSignal: "Official source, but multi-concept catalog",
      note: "官方站可读且商品页含价格与描述，但它不是纯 JYSK 单品牌目录。"
    },
    {
      country: "Kosovo",
      site: "https://jysk-ks.com",
      status: "blocked",
      statusLabel: "Insufficient",
      kitchenUrl: "https://jysk-ks.com/public/home",
      categories: ["Dhomë e ngrënies", "Artikuj Shtëpiak"],
      countSignal: "Homepage only · no stable kitchen product feed",
      note: "能看到 broad home buckets，但没有稳定的 KITCHEN 商品层证据。"
    },
    {
      country: "Latvia",
      site: "https://www.jysk.lv",
      status: "blocked",
      statusLabel: "Blocked",
      kitchenUrl: "https://www.jysk.lv",
      categories: [],
      countSignal: "Cloudflare blocked",
      note: "主页与 sitemap/API 均被 Cloudflare challenge 挡住。"
    },
    {
      country: "Malta",
      site: "https://jysk.com.mt",
      status: "priced",
      statusLabel: "Product-level",
      kitchenUrl: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/",
      categories: ["Kitchen accessories", "Table Linen", "Dishcloths", "Place Mats", "Tablecloths"],
      countSignal: "Kitchen accessories 64 · Table Linen 101",
      note: "公开 Store API 最干净，是最适合做结构化 dashboard 的市场。"
    },
    {
      country: "Montenegro",
      site: "https://www.jysk.me",
      status: "category",
      statusLabel: "Category-only",
      kitchenUrl: "https://www.jysk.me/pokucstvo/domacinstvo/",
      categories: ["Domaćinstvo", "Kuhinjske krpe", "Stolnjaci"],
      countSignal: "Public HTML only · no stable numeric count",
      note: "能确认桌布、茶巾等厨房纺织方向，但结构化商品流不稳定。"
    },
    {
      country: "Tajikistan",
      site: "https://jysk.tj",
      status: "category",
      statusLabel: "Category-only",
      kitchenUrl: "https://jysk.tj/category/kuhnya",
      categories: ["Посуда", "Кухонные принадлежности", "Набор для столовой", "Скатерти и салфетки"],
      countSignal: "Sitemap public · no stable product feed",
      note: "类目树非常完整，但本轮没有拿到稳定商品级价格流。"
    },
    {
      country: "Vietnam",
      site: "https://jysk.vn",
      status: "category",
      statusLabel: "Category-only",
      kitchenUrl: "https://jysk.vn/phong-an",
      categories: ["Ly & cốc", "Chén, bát, đĩa & dao, thìa, dĩa", "Dụng cụ làm bếp", "Phụ kiện phòng bếp", "Tấm lót đĩa"],
      countSignal: "HTML + sitemap + menu proof only",
      note: "类目层很完整，但需要站点定制解析才能稳定还原商品流。"
    }
  ],
  categoryAtlas: [
    {
      key: "mugs",
      name: "马克杯 / Espresso cups",
      marketCount: "10+ markets confirmed",
      countSignal: "Azerbaijan sitemap keyword hit · fincan 10",
      read: "JYSK KITCHEN 里的杯不是高溢价器皿路线，而是 entry-price 早餐杯 + espresso cup + 少量有色 accent mug 的组合。中性色最稳，点缀色只做小剂量。",
      directionHeadline: "开发方向：做一套低价可复制的早餐杯体系，再用一两个点缀色做轻升级。",
      bullets: [
        "核心容量带放在 11cl espresso 与 20–37cl breakfast mug，两端都被多个市场重复验证。",
        "颜色以 beige / grey / white 为底，再加 dusty grape 这类单点色，不要一上来做大面积彩釉阵列。",
        "优先考虑 2pc / 4pc giftable 组合和 stackable 结构，保持 value-led。"
      ],
      products: [
        {
          country: "Albania",
          market: "AL",
          name: "Filxhan JON ø8x8cm 200ml e bardhë",
          price: "ALL 150",
          spec: "200ml white stone cup; 8x8 cm; food contact yes; dishwasher no.",
          url: "https://jysk.al/public/ck/prd/4912457/50479196-0220-11ef-be14-bfb669897a6b"
        },
        {
          country: "Azerbaijan",
          market: "AZ",
          name: "Fincan HENNING 20cl O7xH9cm boz",
          price: "AZN 4.50",
          spec: "20cl grey ceramic cup; dishwasher-safe; entry-price neutral mug.",
          url: "https://jysk.az/az/product/fincan-henning-20cl-o7xh9cm-boz-11490"
        },
        {
          country: "Georgia",
          market: "GE",
          name: "Coffee cup DETMER Ø9x7cm 22cl beige",
          price: "GEL 9.55",
          spec: "22cl beige ceramic; dishwasher-safe; breakfast / espresso bridge line.",
          url: "https://jysk.ge/product/coffee-cup-detmer-%C3%B89xh7cm-22cl-beige"
        },
        {
          country: "Georgia",
          market: "GE",
          name: "Mug HILMER Ø8x9cm 32cl glass",
          price: "GEL 15.55",
          spec: "320ml clear glass mug; more decorative than the DETMER line.",
          url: "https://jysk.ge/product/mug-hilmer-%C3%B88xh9cm-32cl-glass-wpalm"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Mug MELVIN D.10xH9cm 37cl dusty grape",
          price: "EUR 5.00",
          spec: "37cl accent mug; dusty-grape shade shows how JYSK adds small color punctuation.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Espresso cup DETMER D.7xH5cm 11cl beige",
          price: "EUR 2.49",
          spec: "11cl beige espresso cup; very clear value anchor.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Iceland",
          market: "IS",
          name: "DANFRED bolli Ø11xH7cm 35cl beige",
          price: "ISK 995",
          spec: "35cl beige mug; soft breakfast silhouette.",
          url: "https://www.jysk.is/smavara/eldhusvorur/glos-bollar-og-floskur/"
        },
        {
          country: "Uruguay",
          market: "UY",
          name: "Taza espresso DETMER Ø7xH5cm 11cl beige",
          price: "UYU 143",
          spec: "The same DETMER espresso family repeats in South America.",
          url: "https://www.jysk.uy/catalogo/taza-espresso-detmer-7xh5-cm-11-cl-beige_4912638_4912638"
        },
        {
          country: "North Macedonia",
          market: "MK",
          name: "Филџан за еспрессо DETMER ø7x5cm 11cl крем",
          price: "MKD 135",
          spec: "11cl cream espresso cup; tight entry-price positioning.",
          url: "https://jysk.mk/public/ck/prd/4912638/84e77196-0220-11ef-bb4a-03e7f55734be"
        },
        {
          country: "Faroe Islands",
          market: "FO",
          name: "MELVIN krúss Ø10xH9cm 37cl plomme",
          price: "DKK 30",
          spec: "Plum-toned mug; the same small-color strategy appears again.",
          url: "https://jysk.fo/stok-vara/MELVIN-kruB-O10xH9cm-37cl-blomme-farva/?PathId=a96a8b2b-f2b1-426c-994b-b57772a503ed"
        }
      ]
    },
    {
      key: "glasses",
      name: "玻璃杯 / 酒杯 / 水壶",
      marketCount: "10+ markets confirmed",
      countSignal: "Azerbaijan sitemap keyword hit · stekan 7",
      read: "玻璃器皿是最强的重复家族。FERDINAND、TORRE、JIMMI 这种 clear-glass family 在不同市场反复出现，说明 JYSK 用它做基础桌面温度计。",
      directionHeadline: "开发方向：做统一透明玻璃家族，而不是零散单品。",
      bullets: [
        "优先打造 clear tumbler + stem glass + jug 的成组语言，先做 family 再做花样。",
        "保留 2pcs/pk 与低价单只的双结构：前者做送礼/替换，后者做走量。",
        "可以少量加 smoke / grey tint，但不要破坏基础 clear line 的规模感。"
      ],
      products: [
        {
          country: "Azerbaijan",
          market: "AZ",
          name: "Stəkan FERDINAND 400 ml",
          price: "AZN 4.00",
          spec: "Clear glass; about 0.4L; dishwasher-safe; classic entry tumbler.",
          url: "https://jysk.az/az/product/stekan-ferdinand-400-ml-11483"
        },
        {
          country: "Georgia",
          market: "GE",
          name: "Drinking glass FERDINAND 32cl clear",
          price: "GEL 5.35",
          spec: "320ml clear glass; one of the most repeated families across markets.",
          url: "https://jysk.ge/product/drinking-glass-ferdinand-32cl-clear"
        },
        {
          country: "Iceland",
          market: "IS",
          name: "FERDINAND glas Ø8xH10 cm 32 cl",
          price: "ISK 499",
          spec: "Clear drinking glass; the Iceland price point confirms value-led positioning.",
          url: "https://www.jysk.is/smavara/eldhusvorur/glos-bollar-og-floskur/"
        },
        {
          country: "Iceland",
          market: "IS",
          name: "FERDINAND glas Ø7xH14 cm 40 cl",
          price: "ISK 595",
          spec: "Taller clear glass in the same family.",
          url: "https://www.jysk.is/smavara/eldhusvorur/glos-bollar-og-floskur/"
        },
        {
          country: "Iceland",
          market: "IS",
          name: "TORRE glös Ø9xH10 cm 42 cl 2 stk",
          price: "ISK 1695",
          spec: "2-pack stem / tumbler-like glass set; premium step-up over FERDINAND.",
          url: "https://www.jysk.is/smavara/eldhusvorur/glos-bollar-og-floskur/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Drinking glass TORRE D.9xH10cm 42cl 2pcs/pk",
          price: "EUR 6.00",
          spec: "2-pack glass line; confirms TORRE as the upgrade family.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Wine glass TORRE H24cm 43cl 2pcs/pk",
          price: "EUR 12.00",
          spec: "Stemware extension of the TORRE family.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Jug JIMMI D.10xH24cm 1.25L glass",
          price: "EUR 10.00",
          spec: "Pitcher / jug companion to the glass family.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Moldova",
          market: "MD",
          name: "Pahare GERLEF Ø9x10cm 4 buc/set var",
          price: "MDL 40",
          spec: "Plastic daily-use cups; smooth outside with grooves inside; 4 assorted pieces.",
          url: "https://jysk.md/ro/product/pahare-gerlef-9x10cm-4-buc-set-var-428621"
        },
        {
          country: "Moldova",
          market: "MD",
          name: "Sticlă BRIS 1.1 litri cu 4 pahare",
          price: "MDL 60",
          spec: "Transparent plastic jug set with four glasses; cold-drink utility line.",
          url: "https://jysk.md/ro/product/sticl-bris-1-1-litri-cu-4-pahare-434229"
        },
        {
          country: "Uruguay",
          market: "UY",
          name: "Vaso FERDINAND 40cl transparente",
          price: "UYU 127",
          spec: "Crystal; 40cl; Ø7 x H14 cm; FERDINAND repeats again.",
          url: "https://www.jysk.uy/catalogo/vaso-ferdinand-40cl-transparente_4912338_4912338"
        },
        {
          country: "Armenia",
          market: "AM",
          name: "Բաժակ TORRE Ø9xH10cm 42cl 2հ/տ",
          price: "AMD 2790",
          spec: "2-pack glass line; another TORRE validation point.",
          url: "https://www.jysk.am/hy/product/bazhak-torre-o9xh10cm-42cl-2h-t_116040/"
        }
      ]
    },
    {
      key: "plates-bowls",
      name: "盘 / 碗 / 基础餐盘",
      marketCount: "8+ markets confirmed",
      countSignal: "Azerbaijan sitemap keyword hit · bosqab 22",
      read: "盘碗不是厚重正餐套系路线，而是更轻的 bowl-led / starter-set 逻辑。BERTIL、FERDUS、ELIAS、SIGURD 这类 entry line 很适合做组合销售。",
      directionHeadline: "开发方向：做可混搭的低门槛 stoneware starter family，优先 bowl 与 side plate。",
      bullets: [
        "用 beige / grey / light green 这些低风险色，把 reactive glaze 控制在温和层级。",
        "先铺 19cm side plate、9cm bowl、24–30cm serving bowl 这类高频尺寸，再考虑大盘。",
        "把 assorted / mix-and-match 做成卖点，不必强求完整十二头 formal dinner set。"
      ],
      products: [
        {
          country: "Azerbaijan",
          market: "AZ",
          name: "Boşqab FERDUS 19 sm farfor",
          price: "AZN 6.00",
          spec: "19cm porcelain plate; cream tone; dishwasher-safe.",
          url: "https://jysk.az/az/product/bosqab-ferdus-19-sm-farfor-8212"
        },
        {
          country: "Georgia",
          market: "GE",
          name: "Plate FERDUS Ø19cm grey",
          price: "GEL 7.75",
          spec: "Grey plate in the same FERDUS family.",
          url: "https://jysk.ge/product/plate-ferdus-%C3%B819cm-grey"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Bowl SIGURD D.30xH9cm light green",
          price: "EUR 15.00",
          spec: "Large serving bowl; light-green accent within soft Nordic palette.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Bowl ALF D.15xH6cm blue/white",
          price: "EUR 4.99",
          spec: "Entry bowl; blue-white contrast used sparingly.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Bowl BERTIL D.9xH4cm assorted",
          price: "EUR 2.50",
          spec: "Small assorted bowl; classic starter item.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Plate BERTIL D.10cm assorted",
          price: "EUR 1.75",
          spec: "Small plate; entry price pushes mix-and-match behavior.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Moldova",
          market: "MD",
          name: "Farfurie ELIAS Ø28cm ceramică",
          price: "MDL 125",
          spec: "Light-grey ceramic plate; reactive glaze; double glazed; dishwasher-safe.",
          url: "https://jysk.md/ro/product/farfurie-elias-28cm-ceramic-428623"
        },
        {
          country: "Armenia",
          market: "AM",
          name: "Խորը ափսե BERTIL Ø9xH4cm տեսականի",
          price: "AMD 1290",
          spec: "Deep plate / bowl in assorted entry family.",
          url: "https://www.jysk.am/hy/product/xory-apse-bertil-o9xh4cm-tesakani_115770/"
        },
        {
          country: "Faroe Islands",
          market: "FO",
          name: "BERTIL tallerkur Ø10cm ass.",
          price: "DKK 15",
          spec: "Small plate; confirms BERTIL as a repeated Nordic starter family.",
          url: "https://jysk.fo/stok-vara/BERTIL-tallerkur-O10cm-aB/?PathId=a96a8b2b-f2b1-426c-994b-b57772a503ed"
        },
        {
          country: "Faroe Islands",
          market: "FO",
          name: "BERTIL skál Ø9xH4cm ass.",
          price: "DKK 20",
          spec: "Assorted small bowl; bowl-led entry setup.",
          url: "https://jysk.fo/smavorur/koksvorur/"
        }
      ]
    },
    {
      key: "serving-cutlery",
      name: "刀叉 / 上菜 / 摆台辅助",
      marketCount: "8+ markets confirmed",
      countSignal: "Tajikistan and Vietnam both expose dedicated dining-set / cutlery trees",
      read: "这条线不是高端餐刀故事，而是围绕 16pcs set、沙拉夹、蛋糕盘、基础 serveware 的补位型 assortment。它更像客单价抬升器。",
      directionHeadline: "开发方向：把 cutlery 与 serveware 当成客单价拉升件，不要当独立大生意硬做。",
      bullets: [
        "优先做 16pcs family cutlery、salad server、cake stand 这类成套补位品。",
        "材质以 stainless steel + warm wood accent 最稳，兼顾北欧感与成本。",
        "和玻璃杯、桌布做 cross-merchandising，比单独讲刀叉更有效。"
      ],
      products: [
        {
          country: "Malta",
          market: "MT",
          name: "Salad servers GREGERS 2pcs/pk",
          price: "EUR 6.00",
          spec: "Entry serving helper; repeated in Uruguay as well.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Cutlery set OVE brown 16 pcs/pk",
          price: "EUR 20.00",
          spec: "16-piece set; clear family-level tabletop anchor.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Cake stand SUNE D.28xH10cm white",
          price: "EUR 15.00",
          spec: "Serveware accent piece; useful for table styling upsell.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Uruguay",
          market: "UY",
          name: "Cubiertos de ensalada GREGERS 2u/pk",
          price: "UYU 367",
          spec: "The same GREGERS server line appears in Latin America.",
          url: "https://www.jysk.uy/catalogo/cubiertos-de-ensalada-gregers-2u-pk_4912712_4912712"
        },
        {
          country: "Greenland",
          market: "GL",
          name: "CASA LIVING GLAMOUR BESTIK 16 BLANK STÅL",
          price: "DKK 399.95",
          spec: "16-piece cutlery set in shiny recycled stainless steel; premium outlier in official mixed catalog.",
          url: "https://www.pisiffik.gl/da/bestiks%C3%A6t/160816-casa-living-glamour-bestik-16-blank-st%C3%A5l.html"
        },
        {
          country: "North Macedonia",
          market: "MK",
          name: "Прибор за сервирање · category proof",
          price: "Category-level only",
          spec: "North Macedonia exposes a dedicated serving-ware branch inside KITCHEN.",
          url: "https://jysk.mk/public/ck/gc/0463a7ae-021d-11ef-84b1-2f9d167bade1/prd"
        }
      ]
    },
    {
      key: "utility",
      name: "厨房辅件 / 收纳 / 随行饮用",
      marketCount: "9+ markets confirmed",
      countSignal: "Malta kitchen accessories 64 · Uruguay kitchen accessories 8",
      read: "厨房辅件更像高频补位层：砧板、茶盒、纸巾架、保温瓶这类功能件用来做顺手加购，而不是做强风格单品。",
      directionHeadline: "开发方向：把厨房辅件做成功能型 add-on，与杯盘和桌布同故事陈列。",
      bullets: [
        "木质砧板、纸巾架、茶盒是最稳的 countertop trio。",
        "保温瓶和 commuter mug 可以留作高一点的价格台阶，但不要让它们抢走主 assortment。",
        "包装与陈列要强调 easy add-on：一眼看懂、一单多带。"
      ],
      products: [
        {
          country: "Malta",
          market: "MT",
          name: "Tea box MATHIAS W16xL23xH9cm natural",
          price: "EUR 12.99",
          spec: "Natural tea box; light wood accessory with clear countertop logic.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Cutting board CLAES W25xL50cm acacia wood",
          price: "EUR 20.00",
          spec: "Acacia cutting board; strongest prep-surface signal in the clean API market.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Kitchen roll holder KJELD D.13xH32cm",
          price: "EUR 4.00",
          spec: "Very clear utility add-on with low purchase barrier.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Thermal drinking bottle TORKILD 75cl steel",
          price: "EUR 9.99",
          spec: "Hydration / thermal utility extension inside KITCHEN accessories.",
          url: "https://jysk.com.mt/products/homeware/housewares/kitchen-accessories/"
        },
        {
          country: "Greenland",
          market: "GL",
          name: "STANLEY TRANSIT FLIPTOP MUG 0.47L - ASH",
          price: "DKK 262.46",
          spec: "Premium commuter mug; useful as a ceiling marker, not as the core JYSK price tone.",
          url: "https://www.pisiffik.gl/da/drikkedunke-og-systemer/164965-stanley-transit-fliptop-mug-047l-ash.html"
        },
        {
          country: "Vietnam",
          market: "VN",
          name: "Dụng cụ làm bếp / Phụ kiện phòng bếp · category proof",
          price: "Category-level only",
          spec: "Vietnam has a very explicit kitchen-utility branch, but needs site-specific parsing for full SKU extraction.",
          url: "https://jysk.vn/do-gia-dung/dung-cu-lam-bep"
        }
      ]
    },
    {
      key: "textiles",
      name: "桌面纺织 / 茶巾 / 餐垫",
      marketCount: "8+ markets confirmed",
      countSignal: "Malta table linen 101 · Uruguay textile subcategory total 40",
      read: "公开网页里，table textile 是最容易被低估但最完整的一条线。JYSK 不是只卖杯盘，它明显在用 tablecloth / placemat / tea towel 做整桌故事。",
      directionHeadline: "开发方向：把桌布、餐垫、茶巾当成成套陈列的故事层，而不是零散配件。",
      bullets: [
        "优先做 mute botanical / sand / green 这类北欧安全色，和杯盘保持同色系联动。",
        "把 placemat、napkin、runner、tablecloth 做成一页 story，而不是分散给多个小 SKU 自己说话。",
        "可擦洗 coated / vinyl 款适合承担 volume 与活动价，布艺款负责形象与毛利。"
      ],
      products: [
        {
          country: "Malta",
          market: "MT",
          name: "Tablecloth MARGURIT 140x240 white/green",
          price: "EUR 26.99",
          spec: "Botanical green-white tablecloth; strongest table-story signal.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Place mat TETTEGRAS D.37 natural/green",
          price: "EUR 3.00",
          spec: "Low-entry placemat in natural-green palette.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Place mat BUKKETORN D.38 black",
          price: "EUR 5.99",
          spec: "Dark neutral placemat; lets JYSK broaden without leaving the safe base zone.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Tablecloth GULSIPPA 140x240 dark sand",
          price: "EUR 32.99",
          spec: "Dark-sand cloth; elevated but still commercial.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Tea towel RANUNKEL 50x70 2pcs/pk",
          price: "EUR 5.50",
          spec: "2-pack tea towel; the volume-friendly textile layer.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Tea towel VANDMYNTE 50x70 2pcs/pk",
          price: "EUR 6.00",
          spec: "Tea towel line on promotion; confirms high-frequency replenishment role.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Coated tablecloth SMULTRON 135 beige",
          price: "EUR 6.00",
          spec: "Washable coated tablecloth; strong promotional workhorse.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Malta",
          market: "MT",
          name: "Cloth napkin HEIFRYTLE 40x40 natural",
          price: "EUR 2.25",
          spec: "Entry napkin; useful for building story sets without big ticket jumps.",
          url: "https://jysk.com.mt/products/homeware/table-linen/"
        },
        {
          country: "Uruguay",
          market: "UY",
          name: "Para la mesa subcategory count signal",
          price: "76 visible subcategory SKUs",
          spec: "Manteles 4 · Individuales 16 · Camineros 2 · Servilletas 18 · Vajilla 28 · Accesorios de cocina 8.",
          url: "https://www.jysk.uy/hogar-y-decoracion/para-la-mesa"
        },
        {
          country: "Montenegro / Tajikistan / Vietnam",
          market: "ME / TJ / VN",
          name: "Kitchen textile tree proof",
          price: "Category-level only",
          spec: "Kuhinjske krpe · Stolnjaci · Скатерти и салфетки · Tấm lót đĩa all confirm textile is a core KITCHEN branch, not a side note.",
          url: "https://www.jysk.me/pokucstvo/kuhinjske-krpe/"
        }
      ]
    }
  ],
  recurringFamilies: [
    {
      family: "FERDINAND",
      read: "最像 global workhorse 的 drinking-glass family，在 AZ / GE / IS / MT / UY 反复出现。"
    },
    {
      family: "DETMER",
      read: "最稳的 espresso / small cup family，在 GE / MT / MK / UY 等市场重复，适合做 low-risk core line。"
    },
    {
      family: "TORRE",
      read: "负责 glassware 的升级档，从 tumbler 到 wine glass 都成立。"
    },
    {
      family: "BERTIL",
      read: "小盘小碗的 entry family，适合 mix-and-match starter set。"
    },
    {
      family: "GREGERS / OVE",
      read: "不是主角，但非常适合做客单价抬升器：salad servers 与 16pcs cutlery。"
    },
    {
      family: "JIMMI",
      read: "从 glass 到 jug 都能成立，是 clear glass family 的外延线。"
    },
    {
      family: "SIGURD / ELIAS / FERDUS",
      read: "构成了 bowl / plate 的 soft-stoneware 层，颜色克制、风格安全。"
    },
    {
      family: "Table-linen botanicals",
      read: "MARGURIT / GULSIPPA / HEIFRYTLE 证明桌面纺织是成套陈列的重要故事层。"
    }
  ],
  strategySummary: [
    {
      title: "1. 先做基础透明玻璃家族",
      text: "如果只能押一个全球最稳方向，我会先押 clear glass family。它跨市场复用度最高，也最容易带动 table story。"
    },
    {
      title: "2. 杯盘走暖中性色，不走高彩风险",
      text: "最安全的是 beige / grey / white / light green 这些 muted tones。点缀色能有，但只放在少量 mug 或 bowl 上。"
    },
    {
      title: "3. 桌面纺织不要当附件，要当陈列主线",
      text: "JYSK KITCHEN 公开网页里最容易被低估的是桌布、茶巾、餐垫。它们和杯盘一起讲故事时，页面完成度最高。"
    },
    {
      title: "4. Cutlery 与辅件做加购，不单独重资产扩张",
      text: "刀叉、砧板、纸巾架、茶盒都更适合作为 basket builder，而不是独立爆品赛道。"
    }
  ],
  sources: [
    {
      label: "JYSK Franchise official market list",
      url: "https://jysk.com/jysk-franchise"
    },
    {
      label: "Malta public Store API categories",
      url: "https://jysk.com.mt/wp-json/wc/store/v1/products/categories?per_page=200"
    },
    {
      label: "Malta public Store API product sample",
      url: "https://jysk.com.mt/wp-json/wc/store/v1/products?category=4149&per_page=20"
    },
    {
      label: "Moldova kitchen category",
      url: "https://jysk.md/ro/category/buc-t-rie-145"
    },
    {
      label: "Georgia sitemap",
      url: "https://jysk.ge/sitemap.xml"
    },
    {
      label: "Uruguay para la mesa",
      url: "https://www.jysk.uy/hogar-y-decoracion/para-la-mesa"
    },
    {
      label: "Armenia kitchen category",
      url: "https://www.jysk.am/hy/products/homeware_2525/kitchen_3260/"
    },
    {
      label: "Faroe kitchen category",
      url: "https://jysk.fo/smavorur/koksvorur/"
    },
    {
      label: "Iceland kitchen category",
      url: "https://www.jysk.is/smavara/eldhusvorur/"
    },
    {
      label: "Kuwait sitemap",
      url: "https://jysk.com.kw/media/sitemap/jysk_sitemap.xml"
    },
    {
      label: "Pisiffik sitemap",
      url: "https://www.pisiffik.gl/da/content/196-sitemap"
    },
    {
      label: "Tajikistan kitchen category",
      url: "https://jysk.tj/category/kuhnya"
    },
    {
      label: "Vietnam dining / kitchen tree",
      url: "https://jysk.vn/phong-an"
    }
  ]
};
