#!/usr/bin/env node
// doctor.mjs — Her System 诊断脚本
// 检查系统文件、用户配置、灵魂层、Skills。
// 注意：本脚本能跑起来就说明 Node.js 没问题。Node 缺失/过旧的情况由 doctor SKILL.md 处理。

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_DIR = process.cwd();
const CONFIG = join(PROJECT_DIR, '.claude', 'private', 'user-config.json');
const VERSION_FILE = join(PROJECT_DIR, '.claude', 'VERSION');

// ── 读取版本号 ──
let currentVersion = '';
try { currentVersion = readFileSync(VERSION_FILE, 'utf-8').trim(); } catch (_) {}

// ── 工具函数 ──
const issues = [];
const fixes = [];

function check(label, ok, msg) {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ✗ ${label}`);
    if (msg) issues.push(msg);
  }
}

function section(title) {
  console.log(`\n【${title}】`);
}

// ── 版本头 ──
const nodeVer = process.version;
console.log(`Her System 诊断报告${currentVersion ? ` v${currentVersion}` : ''}  (Node ${nodeVer})`);

// ══════════════════════════════════════════
// 1. 系统文件
// ══════════════════════════════════════════
section('系统文件');

check('CLAUDE.md', existsSync(join(PROJECT_DIR, 'CLAUDE.md')), 'CLAUDE.md 缺失 — 工作区文件不完整，找助教重新拷贝');
check('.claude/CLAUDE.md', existsSync(join(PROJECT_DIR, '.claude', 'CLAUDE.md')), '.claude/CLAUDE.md 缺失 — 工作区文件不完整，找助教重新拷贝');

const settingsFile = join(PROJECT_DIR, '.claude', 'settings.json');
if (existsSync(settingsFile)) {
  try {
    JSON.parse(readFileSync(settingsFile, 'utf-8'));
    check('settings.json', true);
  } catch (_) {
    check('settings.json 格式错误', false, 'settings.json 不是合法 JSON');
  }
} else {
  check('settings.json（未配置，使用默认值）', true);
}

// ══════════════════════════════════════════
// 2. Hooks
// ══════════════════════════════════════════
section('Hooks');

const hooksDir = join(PROJECT_DIR, '.claude', 'hooks');
const hookFiles = [];
if (existsSync(hooksDir)) {
  try {
    for (const f of readdirSync(hooksDir)) {
      if (f.endsWith('.mjs')) hookFiles.push(f);
    }
  } catch (_) {}
}

if (hookFiles.length === 0) {
  check('.claude/hooks/（无 hook，使用默认）', true);
} else {
  for (const hf of hookFiles) {
    const hp = join(hooksDir, hf);
    try {
      execSync(`node --check "${hp}"`, { stdio: 'pipe' });
      check(`hooks/${hf} 语法检查`, true);
    } catch (_) {
      check(`hooks/${hf} 语法错误`, false, `hooks/${hf} node --check 失败`);
    }
  }
}

if (existsSync(settingsFile)) {
  try {
    const settings = JSON.parse(readFileSync(settingsFile, 'utf-8'));
    const hooks = settings.hooks || {};
    for (const event of Object.keys(hooks)) {
      const matchers = Array.isArray(hooks[event]) ? hooks[event] : [hooks[event]];
      for (const m of matchers) {
        for (const cmd of (m.hooks || [])) {
          const command = cmd.command || '';
          const match = command.match(/([\w.\-/]+\.(mjs|js|sh|py))/);
          if (match) {
            const rel = match[1];
            const abs = join(PROJECT_DIR, rel);
            check(`settings.json ${event} → ${rel}`, existsSync(abs), `settings.json 声明的 hook 文件不存在: ${rel}`);
          }
        }
      }
    }
  } catch (_) {}
}

// ══════════════════════════════════════════
// 3. 用户配置
// ══════════════════════════════════════════
section('用户配置');

if (!existsSync(CONFIG)) {
  check('user-config.json（新用户正常）', false);
} else {
  let config;
  try {
    config = JSON.parse(readFileSync(CONFIG, 'utf-8'));
    check('user-config.json', true);
  } catch (_) {
    check('user-config.json 格式错误', false, 'user-config.json 不是合法 JSON');
    config = null;
  }

  if (config) {
    if (config.user_name) check('用户名', true);
    else check('用户名（未设置）', false);

    if (config.agent_name) check('搭档名字', true);
    else check('搭档名字（未设置）', false);

    if (config.soul_dir) check('灵魂层目录', true);
    else check('灵魂层目录（未设置）', false);

    // 版本迁移
    const configVersion = config.installed_version || '';
    if (currentVersion && configVersion !== currentVersion) {
      config.installed_version = currentVersion;
      writeFileSync(CONFIG, JSON.stringify(config, null, 2));
      fixes.push(`installed_version 更新为 ${currentVersion}`);
    }
  }
}

// ══════════════════════════════════════════
// 4. 灵魂层文件
// ══════════════════════════════════════════
section('灵魂层文件');

let soulDir = '';
try {
  const config = JSON.parse(readFileSync(CONFIG, 'utf-8'));
  soulDir = config.soul_dir || '';
} catch (_) {}

if (!soulDir) soulDir = '你的her';

const soulPath = join(PROJECT_DIR, soulDir);
if (!existsSync(soulPath)) {
  check(`${soulDir}/`, false, `灵魂层文件夹 ${soulDir}/ 不存在`);
} else {
  for (const f of ['SOUL.md', 'USER.md', 'MEMORY.md', 'RELATIONS.md', 'MEMORY_LOG.md']) {
    const p = join(soulPath, f);
    check(`${soulDir}/${f}`, existsSync(p));
    if (!existsSync(p)) issues.push(`${soulDir}/${f} 缺失`);
  }
}

// ══════════════════════════════════════════
// 5. Skills
// ══════════════════════════════════════════
section('Skills');

const skillsDir = join(PROJECT_DIR, '.claude', 'skills');
let totalSkills = 0;
const requiredSkills = ['P1-HER初见', 'P2-编写Soul', 'P3-Memory三步验证', 'P4-Skill创建', 'P5-全系统复杂任务'];

if (existsSync(skillsDir)) {
  try {
    const entries = readdirSync(skillsDir);
    for (const entry of entries) {
      const skillMd = join(skillsDir, entry, 'SKILL.md');
      if (statSync(join(skillsDir, entry)).isDirectory() && existsSync(skillMd)) {
        totalSkills++;
      }
    }
  } catch (_) {}
}

check(`已安装 ${totalSkills} 个 Skill`, totalSkills > 0, 'Skills 目录为空 — 工作区文件不完整，找助教重新拷贝');

for (const name of requiredSkills) {
  const skillMd = join(skillsDir, name, 'SKILL.md');
  check(`练习 Skill: ${name}`, existsSync(skillMd), `练习 Skill 缺失: ${name} — 找助教补充`);
}

// ══════════════════════════════════════════
// 6. 私有目录
// ══════════════════════════════════════════
const privateDir = join(PROJECT_DIR, '.claude', 'private');
if (!existsSync(privateDir)) {
  mkdirSync(privateDir, { recursive: true });
  fixes.push('创建了 .claude/private/ 目录');
}

// ══════════════════════════════════════════
// 7. 输出汇总
// ══════════════════════════════════════════
console.log('');
if (issues.length === 0) {
  console.log('系统就绪，可以开始了。');
} else {
  console.log(`发现 ${issues.length} 个问题：`);
  for (const issue of issues) {
    console.log(`  ⚠ ${issue}`);
  }
  console.log('');
  console.log('如果不知道怎么解决，举手找助教帮忙。');
}
if (fixes.length > 0) {
  console.log('');
  console.log('自动修复：');
  for (const f of fixes) {
    console.log(`  ✓ ${f}`);
  }
}
