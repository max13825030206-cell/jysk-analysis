// JYSK Bathroom Weekly Update Script
// Run: node jysk_weekly_update.mjs
// Schedule: Windows Task Scheduler → every Monday 9:00 AM

import { writeFileSync, readFileSync, copyFileSync, existsSync } from 'fs';

const MAIN_FILE = 'D:/Users/Desktop/AI/Her-System/00_专注区/jysk_bathroom_opportunity.html';
const SNAPSHOT_DIR = 'D:/Users/Desktop/AI/Her-System/00_专注区/_snapshots/';
const DATE = new Date().toISOString().slice(0, 10);

// 1. Save current version as dated snapshot
const snapshotPath = SNAPSHOT_DIR + 'jysk_bathroom_' + DATE + '.html';
copyFileSync(MAIN_FILE, snapshotPath);
console.log('[1/4] Saved snapshot: ' + snapshotPath);

// 2. Scrape latest data from JYSK
console.log('[2/4] Scraping JYSK... (requires agent-browser in Claude session)');
console.log('   This step must be run within Claude: "agent-browser open https://jysk.co.uk/bathroom/bathroom-accessories"');
console.log('   Extract: product names, prices, stickers, images, ratings via JSON-LD');
console.log('   Output: updated PRODUCTS array');

// 3. Compare with previous week
const prevWeek = getPreviousMonday();
const prevSnapshot = SNAPSHOT_DIR + 'jysk_bathroom_' + prevWeek + '.html';
if (existsSync(prevSnapshot)) {
  console.log('[3/4] Previous snapshot found: ' + prevSnapshot);
  console.log('   Compare: price changes, new SKUs, discontinued SKUs, rating changes');
} else {
  console.log('[3/4] No previous snapshot — this is the baseline');
}

// 4. Update main file
console.log('[4/4] Ready to update ' + MAIN_FILE);
console.log('   Run within Claude to: replace PRODUCTS array, update header date, re-render all sections');

function getPreviousMonday() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7);
  return d.toISOString().slice(0, 10);
}

console.log('\n=== Weekly update checklist ===');
console.log('☐ Product prices changed (promo start/end)');
console.log('☐ New products added');
console.log('☐ Products discontinued / clearance status changed');
console.log('☐ Popular ranking shifted');
console.log('☐ Ratings updated');
console.log('☐ Snapshot archived: ' + snapshotPath);
console.log('☐ Main file header date updated');
