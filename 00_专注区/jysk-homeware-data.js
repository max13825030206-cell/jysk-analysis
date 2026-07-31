window.JYSK_HOMEWARE_DATA = {
  meta: {
    title: 'JYSK Homeware Overall Public Signal Monitor',
    subtitle: 'JYSK 官网公开整体信号版',
    lastUpdated: '2026-07-27',
    period: 'Weekly public-web refresh',
    mode: '公开官网整体信号，不等于真实 sell-out / POS 销售数据',
    takeaway: '如果只能从官网抓公开信息，最稳的整体判断不是拆到每个国家，而是先看 JYSK 全球网络和公司级经营结果，再看 homeware 的总体公开信号。'
  },
  global: {
    turnoverDkkBn: 46.3,
    turnoverEurBn: 6.2,
    ebitDkkBn: 5.6,
    ebitEurBn: 0.753,
    employees: 34000,
    newStores: 148,
    storeCount: 3600,
    countriesStoresPage: 49,
    countriesStrategyPage: 50,
    directCountries: 29,
    franchiseCountries: 20,
    note: 'JYSK 官方页面目前存在 49 / 50 countries 口径差异：stores/about 页面写 49，strategy 页面写 50。'
  },
  milestones: [
    {
      date: '2025-02',
      title: 'Reached 3,500 stores',
      note: 'JYSK 在 2025 年 2 月宣布全球门店数达到 3,500。'
    },
    {
      date: '2025-03-22',
      title: 'Entered Uruguay',
      note: '通过 franchise 首店进入乌拉圭，也是进入南美的重要节点。'
    },
    {
      date: '2025-04-10',
      title: 'Entered Morocco',
      note: '在卡萨布兰卡开出两家店，是进入非洲的起点。'
    }
  ],
  networkRegions: [
    {
      region: 'Nordics & North Atlantic',
      direct: ['Denmark', 'Finland', 'Norway', 'Sweden'],
      franchise: ['Faroe Islands', 'Greenland', 'Iceland']
    },
    {
      region: 'Western Europe',
      direct: ['Austria', 'Belgium', 'France', 'Germany', 'Ireland', 'Netherlands', 'Switzerland', 'United Kingdom'],
      franchise: []
    },
    {
      region: 'Southern Europe & Mediterranean',
      direct: ['Greece', 'Italy', 'Portugal', 'Spain', 'Türkiye'],
      franchise: ['Malta']
    },
    {
      region: 'Central Europe',
      direct: ['Czech Republic', 'Hungary', 'Poland', 'Slovakia', 'Slovenia'],
      franchise: []
    },
    {
      region: 'Balkans & South-East Europe',
      direct: ['Bosnia', 'Bulgaria', 'Croatia', 'Romania', 'Serbia'],
      franchise: ['Albania', 'Kosovo', 'Montenegro', 'North Macedonia', 'Moldova']
    },
    {
      region: 'Baltics & Eastern Europe',
      direct: ['Ukraine'],
      franchise: ['Estonia', 'Latvia', 'Lithuania']
    },
    {
      region: 'Caucasus & Central Asia',
      direct: [],
      franchise: ['Armenia', 'Azerbaijan', 'Georgia', 'Tajikistan']
    },
    {
      region: 'Middle East',
      direct: [],
      franchise: ['Kuwait']
    },
    {
      region: 'North America',
      direct: [],
      franchise: ['Canada']
    },
    {
      region: 'South America',
      direct: [],
      franchise: ['Uruguay']
    },
    {
      region: 'Africa',
      direct: ['Morocco'],
      franchise: []
    },
    {
      region: 'Asia-Pacific',
      direct: [],
      franchise: ['Vietnam']
    }
  ],
  overallSignals: {
    overallRead: 'JYSK 的公开网页信号整体上更偏 value-led：基础收纳和入门桌面器皿被持续经营，decoration 更像风格和活动的承接层。也就是说，官网更适合读整体运营重心，不适合直接代替真实销量。',
    summaryCards: [
      { label: 'Reference markets checked', value: '4', foot: 'UK / DE / FR / DK' },
      { label: 'Homeware groups tracked', value: '3', foot: 'Storage / Tableware / Decoration' },
      { label: 'Benchmark lines fixed', value: '2', foot: '31L storage + entry glassware' },
      { label: 'Visible stock alerts', value: '2', foot: 'Both observed on France pages' }
    ],
    categorySignals: [
      {
        label: 'Tableware',
        score: 73,
        visibility: '4/4 markets identifiable',
        promo: '4/4 show value or discount cues',
        stock: '1 observed benchmark stock alert',
        summary: '公开信号最完整，既能看价位，也能看折扣和缺货，是整体温度计。'
      },
      {
        label: 'Storage',
        score: 71,
        visibility: '3/4 markets clear price visibility',
        promo: '3/4 show low-price or discount cues',
        stock: '1 observed benchmark stock alert',
        summary: '基础收纳是最适合做整体周更追踪的 homeware 方向，功能明确，价位带稳定，可比性最好。'
      },
      {
        label: 'Decoration',
        score: 60,
        visibility: 'price clarity weak overall',
        promo: 'promotion rhythm visible but uneven',
        stock: 'no benchmark stock alert',
        summary: '更适合读风格主题与活动节奏，不适合直接当整体销量替代。'
      }
    ],
    thermometers: [
      {
        label: '31L storage box family',
        coverage: '4/4 markets identifiable',
        promo: '3/4 with low-price or markdown cue',
        stock: '1/4 stock alert',
        read: '基础收纳带被稳定经营，且法国端出现了可见缺货压力。'
      },
      {
        label: 'Entry glassware / mug family',
        coverage: '4/4 markets identifiable',
        promo: '4/4 with value or discount cue',
        stock: '1/4 stock alert',
        read: '桌面基础器皿是更强的公开价格战场，也是更好的整体温度计。'
      }
    ]
  },
  methodology: [
    '只使用 JYSK 官方官网公开页面与公开商品页，不引入第三方销量估算。',
    '先看全球公司级整体数据，再把少数参考官网市场读到的公开信号汇总成整体判断。',
    '这个页面输出的是 overall public web signal，不等同于真实 sell-out、GMV、margin 或门店 POS。',
    '如果后续要真正做“整体销售数据”，仍然需要 JYSK 内部销售源，而不是官网价格页。'
  ],
  sources: [
    { label: 'JYSK Annual Report FY2024/25', url: 'https://jysk.com/annual-report' },
    { label: 'JYSK Stores', url: 'https://www.jysk.com/jysk-stores' },
    { label: 'JYSK Strategy', url: 'https://jysk.com/strategy' },
    { label: 'JYSK Franchise', url: 'https://www.jysk.com/jysk-franchise' },
    { label: 'JYSK History', url: 'https://jysk.com/history-jysk' },
    { label: 'JYSK UK storage', url: 'https://jysk.co.uk/storage?onlinesales=1' },
    { label: 'JYSK UK decoration', url: 'https://jysk.co.uk/homeware/decoration/decorative-accessory?onlinesales=1' },
    { label: 'JYSK UK tableware', url: 'https://jysk.co.uk/homeware/kitchen/drinking-glasses-mugs' },
    { label: 'JYSK Germany storage', url: 'https://jysk.de/aufbewahrung/korbe-und-boxen/kunststoff-aufbewahrung/aufbewahrungsbox-basic-box-31l-m-deckel' },
    { label: 'JYSK Germany decoration', url: 'https://jysk.de/wohnaccessoires/deko' },
    { label: 'JYSK Germany tableware', url: 'https://jysk.de/wohnaccessoires/kuchenaccessoires/glaser-und-tassen/wasserglas-ferdinand-40cl-transparent' },
    { label: 'JYSK France storage', url: 'https://jysk.fr/rangement/corbeilles/boite-de-rangement-plastique/boite-de-rangement-basic-box-31l-couvercle-transparent' },
    { label: 'JYSK France decoration', url: 'https://jysk.fr/decoration-dinterieur/decoration/accessoires-deco' },
    { label: 'JYSK France tableware', url: 'https://jysk.fr/decoration-dinterieur/cuisine/verres-tasses-et-mugs/tasse-anders-verre-o13xh8cm-40cl-ass' },
    { label: 'JYSK Denmark storage', url: 'https://jysk.dk/opbevaring/opbevaringskasser-og-kurve' },
    { label: 'JYSK Denmark decoration', url: 'https://jysk.dk/indretning/dekoration' },
    { label: 'JYSK Denmark tableware', url: 'https://jysk.dk/indretning/kokken/glas-og-krus' }
  ]
};