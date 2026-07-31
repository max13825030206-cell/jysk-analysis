#!/usr/bin/env node
// memory-checkpoint.mjs — Stop hook：每 8 轮强制记忆冲刷
// 按 session_id 独立计数，state 存 os.tmpdir()（跨平台 /tmp 或 %TEMP%）
// 跨平台：Node + process.stdin + 相对路径（Mac / Windows Git Bash 实测通过）
// 异常一律 exit 0，不中断学员对话

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function cleanOldCounters(dir) {
  try {
    const now = Date.now();
    const ttl = 7 * 24 * 3600 * 1000;
    for (const name of readdirSync(dir)) {
      if (!name.startsWith("her-college-stopcount-")) continue;
      const p = join(dir, name);
      try {
        if (now - statSync(p).mtimeMs > ttl) unlinkSync(p);
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
}

try {
  const raw = await readStdin();
  let input = {};
  try { input = JSON.parse(raw); } catch { process.exit(0); }

  if (input.stop_hook_active === true) process.exit(0);

  const sessionId = input.session_id || "";
  if (!sessionId) process.exit(0);

  const projectDir = process.cwd();
  const configPath = join(projectDir, ".claude", "private", "user-config.json");
  if (!existsSync(configPath)) process.exit(0);

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8"));
  } catch { process.exit(0); }

  const soulDir = config.soul_dir;
  if (!soulDir) process.exit(0);

  const tmpDir = tmpdir();
  cleanOldCounters(tmpDir);

  const countFile = join(tmpDir, `her-college-stopcount-${sessionId}`);
  let count = 0;
  if (existsSync(countFile)) {
    try {
      count = parseInt(readFileSync(countFile, "utf-8"), 10) || 0;
    } catch { count = 0; }
  }
  count += 1;
  try { writeFileSync(countFile, String(count)); } catch { /* skip */ }

  if (count % 8 !== 0) process.exit(0);

  const today = new Date().toLocaleDateString("sv-SE");

  const reason =
    `【记忆检查点·第${count}轮】每 8 轮执行一次记忆冲刷。\n` +
    `逐条执行以下检查，完成后正常结束：\n` +
    `① 最近轮次是否引用了 ${soulDir}/MEMORY.md 条目 → 有则更新对应条目的 last_activated 为 ${today}\n` +
    `② 是否有新的认知偏差修正、空白填补、或出现 2 次以上的模式 → 有则直接写入 ${soulDir}/MEMORY.md 动态记忆\n` +
    `③ 是否有未写入的碎片观察（AI 对自身/合作关系的反思）→ 有则写入 ${soulDir}/观察笔记.md\n` +
    `④ 今天的日记 ${soulDir}/日记/${today}.md 是否需要补写/追写？\n` +
    `⑤ 有没有对 MEMORY.md 的变更还没写进 MEMORY_LOG → 有则补记\n` +
    `没有就没有，但必须逐条过一遍再跳过。静默执行，不要向用户播报自检过程。`;

  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
} catch {
  process.exit(0);
}
