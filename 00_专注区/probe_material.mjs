// Batch material checker: visits each JYSK product page, extracts Material from body text
// Usage: node probe_material.mjs > material_results.json

const PRODUCTS = [
  {sku:"2782400",name:"Soap dispenser GENEVAD recycled glass brown",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-genevad-recycled-glass-brown"},
  {sku:"2782900",name:"Soap dispenser SMEDBY light grey",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-smedby-light-grey"},
  {sku:"2786100",name:"Soap dispenser LYCKSELE terrazzo effect",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-lycksele-terrazzo-effect"},
  {sku:"2784903",name:"Soap dispenser MAKARYD marbel effect brown",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-makaryd-marbel-effect-brown"},
  {sku:"2702400",name:"Soap dispenser KUNGSBACKA marble effect",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-kungsbacka-marble-effect"},
  {sku:"2779900",name:"Soap dispenser SANGIS recycled plastic assorted",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-sangis-recycled-plastic-assorted"},
  {sku:"2780900",name:"Bathroom set VISLANDA 3 pcs/set asstd",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/bathroom-set-vislanda-3-pcs-set-asstd"},
  {sku:"2785500",name:"Soap dispenser KARLSKRONA glass",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-karlskrona-glass"},
  {sku:"2781000",name:"Soap dispenser ROSENLUND assorted",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-rosenlund-assorted"},
  {sku:"2783840",name:"Soap dispenser MALA black",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-mala-black"},
  {sku:"2769100",name:"Soap dispenser GESUNDA mat glazed",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-gesunda-mat-glazed"},
  {sku:"2782001",name:"Soap dispenser ROTEBERG grey",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-roteberg-grey"},
  {sku:"2773112",name:"Soap dispenser STENINGE beige",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-steninge-beige"},
  {sku:"2781101",name:"Soap dispenser EKBY white",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-ekby-white"},
  {sku:"2781140",name:"Soap dispenser EKBY black",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-ekby-black"},
  {sku:"2729700",name:"Soap dispenser LEKERYD brown",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-lekeryd-brown"},
  {sku:"2700740",name:"Bathroom set LINDSSDAL 3 piece set black",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/bathroom-set-lindssdal-3-piece-set-black"},
  {sku:"2778566",name:"Soap dispenser KATTARP green",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-kattarp-green"},
  {sku:"2777712",name:"Soap dispenser TORUP beige stone",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-torup-beige-stone"},
  {sku:"2764740",name:"Soap dispenser TORESTORP black XL",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-torestorp-black-xl"},
  {sku:"2754042",name:"Soap dispenser HUSBY sensor grey",url:"https://jysk.co.uk/bathroom/bathroom-accessories/soap-dispensers/soap-dispenser-husby-sensor-grey"},
  {sku:"2782401",name:"Toothbrush holder GENEVAD brown recycled glass",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-genevad-brown-recycled-glass"},
  {sku:"2786101",name:"Tooth brush holder LYCKSELE terrazzo effect",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/tooth-brush-holder-lycksele-terrazzo-effect"},
  {sku:"2702401",name:"Toothbrush holder KUNGSBACKA marble effect",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-kungsbacka-marble-effect"},
  {sku:"2783940",name:"Toothbrush holder MALA black",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-mala-black"},
  {sku:"2785501",name:"Toothbrush holder KARLSKRONA glass",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-karlskrona-glass"},
  {sku:"2773212",name:"Toothbrush holder STENINGE beige",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-steninge-beige"},
  {sku:"2781201",name:"Toothbrush holder EKBY white",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-ekby-white"},
  {sku:"2781240",name:"Toothbrush holder EKBY black",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-ekby-black"},
  {sku:"2729701",name:"Toothbrush holder LEKERYD brown",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-lekeryd-brown"},
  {sku:"2769200",name:"Toothbrush holder GESUNDA mat glazed",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-gesunda-mat-glazed"},
  {sku:"2778666",name:"Toothbrush holder KATTARP green",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-kattarp-green"},
  {sku:"2782002",name:"Toothbrush holder ROTEBERG anthracite grey",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-roteberg-anthracite-grey"},
  {sku:"2777512",name:"Toothbrush holder TORUP beige stone",url:"https://jysk.co.uk/bathroom/bathroom-accessories/toothbrush-holder/toothbrush-holder-torup-beige-stone"},
];

// Classify by material keywords from spec
function classify(materialText) {
  const t = materialText.toLowerCase();
  if (t.includes('polyresin')) return 'POLYRESIN';
  if (t.includes('stoneware')) return 'CERAMIC';
  if (t.includes('glass')) return 'GLASS';
  return 'OTHER';
}

// Output JSON for each product
const results = [];
for (const p of PRODUCTS) {
  try {
    const resp = await fetch(p.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await resp.text();
    const match = text.match(/Material[^<]{0,300}/);
    const materialText = match ? match[0].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : 'NOT FOUND';
    const mat = classify(materialText);
    results.push({ sku: p.sku, name: p.name, material: materialText, class: mat });
  } catch(e) {
    results.push({ sku: p.sku, name: p.name, material: 'ERROR: ' + e.message, class: 'ERROR' });
  }
}

console.log(JSON.stringify(results, null, 2));
