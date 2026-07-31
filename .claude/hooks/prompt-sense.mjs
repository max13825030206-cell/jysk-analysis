#!/usr/bin/env node
// prompt-sense.mjs — UserPromptSubmit hook：每条用户消息的轻量感知层
//
// 注入内容（<10ms，极简无状态）：
//   1. 实时北京时间（防长对话时间漂移 / 压缩后时间丢失）
//   2. 间隔检测：距上条消息 > 2h → 提醒检查遗留
//   3. 情绪标记检测：!!! 开头 / ??? 开头
//   4. 纠正检测："不对""记错了"等信号 → 立即回溯
//
// 跨平台：Node + os.tmpdir() + 相对路径，Mac / Windows Git Bash 通用

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

async function drainStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function formatBeijingTime() {
  const now = new Date();
  const bj = new Date(now.getTime() + 8 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const weekdayEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][bj.getUTCDay()];
  const yyyy = bj.getUTCFullYear();
  const mm = pad(bj.getUTCMonth() + 1);
  const dd = pad(bj.getUTCDate());
  const hh = pad(bj.getUTCHours());
  const mi = pad(bj.getUTCMinutes());

  const tmp = new Date(Date.UTC(bj.getUTCFullYear(), bj.getUTCMonth(), bj.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  const weekStr = `W${pad(weekNum)}`;

  const monday = new Date(Date.UTC(bj.getUTCFullYear(), bj.getUTCMonth(), bj.getUTCDate()));
  const dow = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - dow);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const range = `${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())} ~ ${pad(sunday.getUTCMonth() + 1)}-${pad(sunday.getUTCDate())}`;

  return `${yyyy}-${mm}-${dd} ${weekdayEn} ${hh}:${mi} | ${weekStr} (${range})`;
}

try {
  const raw = await drainStdin();
  let input = {};
  try { input = JSON.parse(raw); } catch { /* 即使 JSON 无效也继续输出时间 */ }

  const sessionId = input.session_id || "unknown";
  const prompt = input.prompt || "";
  const tmp = tmpdir();
  const messages = [];

  // 1. 时间注入（每条消息都刷新）
  messages.push(`[datetime] 北京时间: ${formatBeijingTime()}`);

  // 2. 间隔检测
  const lastMsgFile = join(tmp, `her-college-lastmsg-${sessionId}`);
  const gapRemindedFile = join(tmp, `her-college-gap-${sessionId}`);
  const nowMs = Date.now();
  try {
    if (existsSync(lastMsgFile) && !existsSync(gapRemindedFile)) {
      const lastEpoch = parseInt(readFileSync(lastMsgFile, "utf-8"), 10);
      if (Number.isFinite(lastEpoch)) {
        const gap = nowMs - lastEpoch;
        if (gap > 2 * 3600 * 1000) {
          const hours = Math.floor(gap / 3600000);
          messages.push(
            `【间隔检测】距上条消息已过 ${hours} 小时。暂停当前任务，先检查上段对话的遗留：\n` +
            `① _本周.md 是否需要补记？\n` +
            `② 是否有未写入的记忆操作（MEMORY.md / 观察笔记 / 日记）？\n` +
            `逐条过一遍，完成后再继续。`
          );
          writeFileSync(gapRemindedFile, "");
        }
      }
    }
    writeFileSync(lastMsgFile, String(nowMs));
  } catch { /* 写不了 tmp 就算了，不中断 */ }

  // 3. 情绪标记检测（必须开头）
  const trimmed = prompt.replace(/^\s+/, "");
  if (/^(!{3}|！{3})/.test(trimmed)) {
    messages.push("【惊艳标记】用户标记了一个特别好的时刻。回溯最近 2-3 轮输出，找到触发原因，然后简短追问用户。");
  } else if (/^(\?{3}|？{3})/.test(trimmed)) {
    messages.push("【不对劲标记】用户标记了一个感受不对的时刻。立即回溯，定位问题，诚实回应用户。");
  }

  // 4. 纠正检测
  const corrPattern = /(不对|不是这样|你记错了|你搞错了|说错了|弄反了|理解错了|不是那个意思|你误解了|搞混了)/;
  const corrMatch = prompt.match(corrPattern);
  if (corrMatch) {
    messages.push(`【纠正检测】用户消息中出现纠正信号「${corrMatch[1]}」。评估：哪里理解错了？`);
  }

  process.stdout.write(messages.join("\n") + "\n");
  process.exit(0);
} catch {
  process.exit(0);
}
