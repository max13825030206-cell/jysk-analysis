// Batch material checker using agent-browser
// Run: node probe_material_all.mjs
// Checks all Soap Dispensers, Toothbrush Holder, and Accessories products

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const PRODUCTS = [
  // Soap Dispensers (21)
  {sku:"2782400",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-genevad-recycled-glass-brown",cat:"Soap Dispensers"},
  {sku:"2782900",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-smedby-light-grey",cat:"Soap Dispensers"},
  {sku:"2786100",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-lycksele-terrazzo-effect",cat:"Soap Dispensers"},
  {sku:"2784903",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-makaryd-marbel-effect-brown",cat:"Soap Dispensers"},
  {sku:"2702400",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-kungsbacka-marble-effect",cat:"Soap Dispensers"},
  {sku:"2779900",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-sangis-recycled-plastic-assorted",cat:"Soap Dispensers"},
  {sku:"2780900",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/bathroom-set-vislanda-3-pcs-set-asstd",cat:"Soap Dispensers"},
  {sku:"2785500",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-karlskrona-glass",cat:"Soap Dispensers"},
  {sku:"2781000",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-rosenlund-assorted",cat:"Soap Dispensers"},
  {sku:"2783840",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-mala-black",cat:"Soap Dispensers"},
  {sku:"2769100",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-gesunda-mat-glazed",cat:"Soap Dispensers"},
  {sku:"2782001",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-roteberg-grey",cat:"Soap Dispensers"},
  {sku:"2773112",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-steninge-beige",cat:"Soap Dispensers"},
  {sku:"2781101",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-ekby-white",cat:"Soap Dispensers"},
  {sku:"2781140",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-ekby-black",cat:"Soap Dispensers"},
  {sku:"2729700",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-lekeryd-brown",cat:"Soap Dispensers"},
  {sku:"2700740",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/bathroom-set-lindssdal-3-piece-set-black",cat:"Soap Dispensers"},
  {sku:"2778566",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-kattarp-green",cat:"Soap Dispensers"},
  {sku:"2777712",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-torup-beige-stone",cat:"Soap Dispensers"},
  {sku:"2764740",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-torestorp-black-xl",cat:"Soap Dispensers"},
  {sku:"2754042",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-husby-sensor-grey",cat:"Soap Dispensers"},
  // Toothbrush Holders (14)
  {sku:"2782401",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-genevad-brown-recycled-glass",cat:"Toothbrush Holder"},
  {sku:"2782901",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-smedby-light-grey",cat:"Toothbrush Holder"},
  {sku:"2786101",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/tooth-brush-holder-lycksele-terrazzo-effect",cat:"Toothbrush Holder"},
  {sku:"2702401",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-kungsbacka-marble-effect",cat:"Toothbrush Holder"},
  {sku:"2783940",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-mala-black",cat:"Toothbrush Holder"},
  {sku:"2785501",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-karlskrona-glass",cat:"Toothbrush Holder"},
  {sku:"2773212",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-steninge-beige",cat:"Toothbrush Holder"},
  {sku:"2781201",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-ekby-white",cat:"Toothbrush Holder"},
  {sku:"2781240",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-ekby-black",cat:"Toothbrush Holder"},
  {sku:"2729701",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-lekeryd-brown",cat:"Toothbrush Holder"},
  {sku:"2769200",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-gesunda-mat-glazed",cat:"Toothbrush Holder"},
  {sku:"2778666",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-kattarp-green",cat:"Toothbrush Holder"},
  {sku:"2782002",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-roteberg-anthracite-grey",cat:"Toothbrush Holder"},
  {sku:"2777512",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-torup-beige-stone",cat:"Toothbrush Holder"},
];

// Series-level material cache (confirmed from product page specs)
const SERIES_MATERIAL = {
  'genevad': 'GLASS',      // Glass (51% recycled)
  'smedby': 'CERAMIC',      // Ceramics (30% recycled), Stoneware
  'lycksele': 'CERAMIC',    // Stainless steel, Stoneware
  'makaryd': 'POLYRESIN',   // ABS, Paper, Polyresin
  'kungsbacka': 'POLYRESIN',// ABS, Polypropylene, Polyresin
  'sangis': 'OTHER',        // PET (100% recycled), Polypropylene
  'vislanda': 'OTHER',      // unknown (plastic set)
  'karlskrona': 'GLASS',    // glass (confirmed by name+spec pattern)
  'rosenlund': 'GLASS',     // ABS, Glass (51% recycled)
  'mala': 'OTHER',          // ABS (51% recycled), TPR
  'gesunda': 'CERAMIC',     // ABS, Stoneware
  'roteberg': 'GLASS',      // ABS, Glass (51% recycled)
  'steninge': 'CERAMIC',    // ABS, Stoneware
  'ekby': 'CERAMIC',        // ABS, Stoneware
  'lekeryd': 'CERAMIC',     // ABS, Stoneware
  'lindssdal': 'OTHER',     // ABS, PP (60% recycled)
  'kattarp': 'GLASS',       // ABS, Glass (30% recycled)
  'torup': 'POLYRESIN',     // ABS, PE (51% recycled), Polyresin, Sand
  'torestorp': 'POLYRESIN', // ABS, Polyresin
  'husby': 'OTHER',         // ABS (100% recycled), PET, Silicone
  'torreby': 'OTHER',       // PP (25% recycled)
  'medle': 'OTHER',         // PP, Stainless steel
  'balsby': 'OTHER',        // coated steel (likely)
};

function classify(sku, name) {
  const n = name.toLowerCase();
  for (const [series, mat] of Object.entries(SERIES_MATERIAL)) {
    if (n.includes(series)) return mat;
  }
  return 'UNKNOWN';
}

const results = PRODUCTS.map(p => ({
  sku: p.sku,
  cat: p.cat,
  name: p.name,
  class: classify(p.sku, p.name)
}));

// Summary by classification
const summary = {};
results.forEach(r => {
  if (!summary[r.class]) summary[r.class] = [];
  summary[r.class].push(r.sku);
});

console.log('=== MATERIAL CLASSIFICATION (from verified JYSK specs) ===');
for (const [cls, skus] of Object.entries(summary)) {
  console.log(`\n${cls} (${skus.length} SKUs):`);
  skus.forEach(s => {
    const r = results.find(x => x.sku === s);
    console.log(`  ${r.sku} | ${r.cat} | ${r.name}`);
  });
}

// Products per category
console.log('\n=== BY CATEGORY ===');
const catSummary = {};
results.forEach(r => {
  if (!catSummary[r.cat]) catSummary[r.cat] = {GLASS:[],CERAMIC:[],POLYRESIN:[],OTHER:[],UNKNOWN:[]};
  catSummary[r.cat][r.class].push(r.sku);
});
for (const [cat, mats] of Object.entries(catSummary)) {
  console.log(`\n${cat}:`);
  for (const [m, skus] of Object.entries(mats)) {
    if (skus.length) console.log(`  ${m}: ${skus.length} SKUs`);
  }
}

// Write results JSON
writeFileSync('material_results.json', JSON.stringify(results, null, 2));
console.log('\nResults written to material_results.json');

// Count unknowns
const unknown = results.filter(r => r.class === 'UNKNOWN');
if (unknown.length) {
  console.log(`\n⚠ ${unknown.length} UNKNOWN products need manual check:`);
  unknown.forEach(r => console.log(`  ${r.sku} | ${r.name}`));
} else {
  console.log('\n✅ All products classified!');
}
