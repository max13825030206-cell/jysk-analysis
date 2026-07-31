#!/usr/bin/env node
// CLI — unified entry point for the customer analysis pipeline
//
// Usage:
//   node src/cli.mjs scrape   [--customer jysk] [--target bathroom]
//   node src/cli.mjs enrich   [--customer jysk] [--target bathroom]
//   node src/cli.mjs analyze  [--customer jysk] [--target bathroom]
//   node src/cli.mjs diff     [--customer jysk] [--target bathroom]
//   node src/cli.mjs dashboard [--customer jysk] [--target bathroom] [--open]
//   node src/cli.mjs weekly   [--customer jysk] [--target bathroom]
//   node src/cli.mjs list
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function loadConfig(customerId) {
  const path = resolve(ROOT, 'configs', `${customerId}.json`);
  if (!existsSync(path)) {
    console.error(`\n❌ Config not found: ${path}`);
    console.error('   Available configs:');
    listConfigs();
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function listConfigs() {
  const configsDir = resolve(ROOT, 'configs');
  if (!existsSync(configsDir)) {
    console.log('  (no configs directory)');
    return [];
  }
  const configs = readdirSync(configsDir).filter(f => f.endsWith('.json'));
  configs.forEach(c => {
    const config = JSON.parse(readFileSync(resolve(configsDir, c), 'utf-8'));
    console.log(`  ${c.replace('.json', '')} — ${config.name} (${config.baseUrl})`);
    if (config.targets) {
      config.targets.forEach(t => console.log(`    └─ ${t.id}: ${t.label}`));
    }
  });
  return configs;
}

function showUsage() {
  console.log(`
╔══════════════════════════════════════════════╗
║   📊 Customer Analysis Toolkit v1.0          ║
╚══════════════════════════════════════════════╝

Usage: node src/cli.mjs <command> [options]

Commands:
  scrape     Scrape product data from retailer website (WooCommerce API)
  enrich     Enrich products with material/spec data from detail pages
  analyze    Run analysis (price bands, materials, opportunities)
  diff       Compare with previous week's snapshot
  dashboard  Generate HTML dashboard
  weekly     Full pipeline (scrape → enrich → analyze → diff → dashboard)
  quick      Fast pipeline without enrichment (scrape → analyze → diff → dashboard)
  list       List available customer configs

Options:
  --customer  Customer ID (default: jysk)
  --target    Target category ID (default: bathroom)
  --skip-enrich  Skip the enrich step in weekly command
  --open      Open dashboard in browser after generation

Examples:
  node src/cli.mjs scrape --customer jysk --target bathroom
  node src/cli.mjs weekly --customer jysk --target kitchen
  node src/cli.mjs quick --target bathroom
  node src/cli.mjs list
  node src/cli.mjs dashboard --target bathroom --open
`);
}

async function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0 || rawArgs.includes('--help') || rawArgs.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  const args = parseArgs(rawArgs);
  const command = args._[0];

  if (command === 'list') {
    console.log('\n📋 Available customer configs:');
    listConfigs();
    process.exit(0);
  }

  const customerId = args.customer || 'jysk';
  const targetId = args.target || 'bathroom';
  const config = loadConfig(customerId);

  const startTime = Date.now();
  console.log(`\n🔧 Running "${command}" for ${config.name} / ${targetId}`);

  try {
    switch (command) {
      case 'scrape': {
        const { scrape } = await import('./scraper.mjs');
        await scrape(config, targetId);
        break;
      }
      case 'enrich': {
        const { enrich } = await import('./enricher.mjs');
        await enrich(config, targetId);
        break;
      }
      case 'analyze': {
        const { analyze } = await import('./analyzer.mjs');
        analyze(config, targetId);
        break;
      }
      case 'diff': {
        const { diff } = await import('./differ.mjs');
        diff(config, targetId);
        break;
      }
      case 'dashboard': {
        const { generateDashboard } = await import('./dashboard.mjs');
        const outPath = generateDashboard(config, targetId);
        if (args.open) {
          const { exec } = await import('child_process');
          exec(`start "" "${outPath}"`);
        }
        break;
      }
      case 'weekly':
      case 'quick': {
        const skipEnrich = args['skip-enrich'] || command === 'quick';
        const steps = skipEnrich ? 4 : 5;
        console.log(`\n📅 Running ${skipEnrich ? 'quick' : 'full'} pipeline (${steps} steps)...\n`);
        console.log('━'.repeat(50));

        console.log(`\n[1/${steps}] SCRAPE`);
        const { scrape } = await import('./scraper.mjs');
        await scrape(config, targetId);

        if (!skipEnrich) {
          console.log(`\n[2/${steps}] ENRICH`);
          const { enrich } = await import('./enricher.mjs');
          await enrich(config, targetId);
        } else {
          console.log(`\n  ⏭ Skipping enrich (use "weekly" for full pipeline)`);
        }

        const stepNum = skipEnrich ? 2 : 3;
        console.log(`\n[${stepNum}/${steps}] ANALYZE`);
        const { analyze } = await import('./analyzer.mjs');
        analyze(config, targetId);

        console.log(`\n[${stepNum + 1}/${steps}] DIFF`);
        const { diff } = await import('./differ.mjs');
        diff(config, targetId);

        console.log(`\n[${stepNum + 2}/${steps}] DASHBOARD`);
        const { generateDashboard } = await import('./dashboard.mjs');
        const outPath = generateDashboard(config, targetId);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n${'═'.repeat(50)}`);
        console.log(`✅ Pipeline complete in ${elapsed}s`);
        console.log(`📄 Dashboard: ${outPath}`);
        break;
      }
      default:
        console.error(`\n❌ Unknown command: ${command}`);
        showUsage();
        process.exit(1);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱ Completed in ${elapsed}s`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }
}

main();
