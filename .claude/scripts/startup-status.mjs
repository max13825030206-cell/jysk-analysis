#!/usr/bin/env node
// startup-status.mjs — 启动状态扫描
// 输出：北京时间 + 最近30文件变动 + Hook配置状态

import { readFileSync, existsSync, statSync, readdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectDir = process.cwd();

// ── 读取配置 ──
const configPath = join(projectDir, ".claude", "private", "user-config.json");
let config;
try {
  config = JSON.parse(readFileSync(configPath, "utf-8"));
} catch {
  config = {};
}

const vault = config.vault_path || projectDir;
const areaLabels = config.area_labels || {};
const TOP_N = 30;

const output = [];

// ══════════════════════════════════════
// 1. 北京时间
// ══════════════════════════════════════
const now = new Date();
const beijingOffset = 8 * 60; // UTC+8 in minutes
const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
const beijingTime = new Date(utcMs + beijingOffset * 60000);

const yyyy = beijingTime.getFullYear();
const mm = String(beijingTime.getMonth() + 1).padStart(2, "0");
const dd = String(beijingTime.getDate()).padStart(2, "0");
const hh = String(beijingTime.getHours()).padStart(2, "0");
const mi = String(beijingTime.getMinutes()).padStart(2, "0");
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const weekday = weekdays[beijingTime.getDay()];

output.push("=== 当前时间（北京） ===");
output.push(`${yyyy}-${mm}-${dd} 星期${weekday} ${hh}:${mi}`);

// ══════════════════════════════════════
// 2. 最近变动文件扫描
// ══════════════════════════════════════
const EXCLUDED_DIRS = new Set([".git", ".obsidian", "node_modules"]);
const EXCLUDED_FILES = new Set([".DS_Store"]);
const EXCLUDED_EXTS = new Set([".pyc"]);

const fileEntries = [];

function walkDir(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile()) {
      if (EXCLUDED_FILES.has(entry.name)) continue;
      const ext = entry.name.lastIndexOf(".") >= 0
        ? entry.name.slice(entry.name.lastIndexOf("."))
        : "";
      if (EXCLUDED_EXTS.has(ext)) continue;
      try {
        const stat = statSync(fullPath);
        fileEntries.push({ path: fullPath, mtime: stat.mtimeMs });
      } catch {
        // skip inaccessible
      }
    }
  }
}

walkDir(vault);
fileEntries.sort((a, b) => b.mtime - a.mtime);
const topFiles = fileEntries.slice(0, TOP_N);

function formatDate(mtimeMs) {
  const d = new Date(mtimeMs);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${m}-${day} ${h}:${mn}`;
}

function getTag(relpath) {
  for (const [prefix, label] of Object.entries(areaLabels)) {
    if (relpath.startsWith(prefix)) return `[${label}]`;
  }
  if (relpath.startsWith(".claude/")) return "[机制]";
  return "[其他]";
}

output.push("");
output.push(`=== 最近变动文件（top ${TOP_N}）===`);
for (const entry of topFiles) {
  const dateStr = formatDate(entry.mtime);
  const relpath = relative(vault, entry.path);
  const tag = getTag(relpath);
  output.push(`${dateStr}  ${tag}  ${relpath}`);
}

// ══════════════════════════════════════
// 3. Hook 配置状态
// ══════════════════════════════════════
output.push("");
output.push("=== Hook 配置状态 ===");

const settingsPath = join(projectDir, ".claude", "settings.json");
try {
  const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
  const hooks = settings.hooks || {};
  const hookEvents = Object.keys(hooks).filter((k) => {
    const val = hooks[k];
    if (Array.isArray(val) && val.length > 0) return true;
    if (typeof val === "object" && val !== null && Object.keys(val).length > 0) return true;
    return false;
  });

  if (hookEvents.length === 0) {
    output.push("当前无 Hook 配置");
  } else {
    for (const event of hookEvents) {
      const matchers = Array.isArray(hooks[event]) ? hooks[event] : [hooks[event]];
      for (const m of matchers) {
        const cmds = m.hooks || [];
        for (const cmd of cmds) {
          output.push(`${event}: ${cmd.command}`);
        }
      }
    }
  }
} catch {
  output.push("无法读取 settings.json");
}

console.log(output.join("\n"));
