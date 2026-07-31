#!/usr/bin/env node
// session-startup.mjs — UserPromptSubmit hook：会话首次消息时自动注入启动上下文
// 机制：用跨平台临时目录的 flag 保证每 session 只跑一次，后续消息 <10ms exit 0
// 输出：stdout 的内容会被 UserPromptSubmit hook 自动注入到模型上下文
// 跨平台：Node + os.tmpdir() + 相对路径，Mac / Windows Git Bash 通用

import { existsSync, writeFileSync, readdirSync, unlinkSync, statSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawnSync } from "child_process";

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

try {
  const raw = await readStdin();
  let input = {};
  try { input = JSON.parse(raw); } catch { process.exit(0); }

  const sessionId = input.session_id || "unknown";
  const projectDir = process.cwd();
  const flagDir = tmpdir();
  const flag = join(flagDir, `her-college-startup-${sessionId}`);

  // 非首次消息直接放行
  if (existsSync(flag)) process.exit(0);
  try { writeFileSync(flag, ""); } catch { /* 写不了 flag 就放弃，但继续注入 */ }

  // 后台顺手清理 24h 以上的旧 flag
  try {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const f of readdirSync(flagDir)) {
      if (!f.startsWith("her-college-startup-")) continue;
      const p = join(flagDir, f);
      try {
        if (statSync(p).mtimeMs < cutoff) unlinkSync(p);
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

  // 调用 startup-status.mjs 获取时间 + 文件变动 + hook 状态
  const statusScript = join(projectDir, ".claude", "scripts", "startup-status.mjs");
  if (!existsSync(statusScript)) process.exit(0);

  const result = spawnSync("node", [statusScript], {
    cwd: projectDir,
    encoding: "utf-8",
    timeout: 12000,
  });
  const scan = (result.stdout || "").trim();
  if (!scan) process.exit(0);

  // 时间部分由 prompt-sense.mjs 每条消息注入，这里跳过 startup-status 的时间段
  // 从「=== 最近变动文件」开始保留
  const lines = scan.split("\n");
  const startIdx = lines.findIndex((l) => l.startsWith("=== 最近变动文件"));
  const out = startIdx >= 0 ? lines.slice(startIdx).join("\n").trim() : scan;

  process.stdout.write(`[session-startup] 会话首次启动扫描\n\n${out}\n`);
  process.exit(0);
} catch {
  process.exit(0);
}
