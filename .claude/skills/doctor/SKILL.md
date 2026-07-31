---
name: doctor
description: Her System 环境诊断。检查系统文件、用户配置、灵魂层、Skills 是否完整。Node.js 缺失时自动安装。
---

# Her System Doctor

用户调用 /doctor 时，执行环境诊断。

## 执行流程

### 第一步：尝试运行诊断脚本

用 Bash 工具运行 `node .claude/scripts/doctor.mjs`。

- **成功**（输出诊断报告）→ 跳到「怎么说」，把结果告诉用户。**这就是 doctor 的完整流程。**
- **失败**（command not found / node 版本太旧报语法错误）→ 说明 Node.js 有问题，进入下方「安装 Node.js」。

### 安装 Node.js

**先告诉用户**（用你自己的话）：Node.js 还没装好，我帮你装一下，1-3 分钟，看网速。

**然后判断系统，用 Bash 工具执行对应命令**：

**Mac 用户**（`uname` 输出 Darwin）：

先判断芯片类型（`uname -m`），然后执行：

M 芯片（arm64）：
```bash
curl -o /tmp/node.tar.gz "https://registry.npmmirror.com/-/binary/node/v22.11.0/node-v22.11.0-darwin-arm64.tar.gz" && mkdir -p ~/.node && tar xzf /tmp/node.tar.gz -C ~/.node --strip-components=1 && echo 'export PATH="$HOME/.node/bin:$PATH"' >> ~/.zshrc && export PATH="$HOME/.node/bin:$PATH" && rm /tmp/node.tar.gz && node --version
```

Intel 芯片（x86_64）：
```bash
curl -o /tmp/node.tar.gz "https://registry.npmmirror.com/-/binary/node/v22.11.0/node-v22.11.0-darwin-x64.tar.gz" && mkdir -p ~/.node && tar xzf /tmp/node.tar.gz -C ~/.node --strip-components=1 && echo 'export PATH="$HOME/.node/bin:$PATH"' >> ~/.zshrc && export PATH="$HOME/.node/bin:$PATH" && rm /tmp/node.tar.gz && node --version
```

**Windows 用户**（`uname` 输出含 MINGW 或 MSYS，或 `$OS` 为 Windows_NT）：

```bash
curl -o /tmp/node.zip "https://registry.npmmirror.com/-/binary/node/v22.11.0/node-v22.11.0-win-x64.zip" && mkdir -p ~/node-install && cd ~/node-install && unzip -o /tmp/node.zip && export PATH="$HOME/node-install/node-v22.11.0-win-x64:$PATH" && rm /tmp/node.zip && node --version
```

然后永久写入用户环境变量（不需要管理员权限）：
```bash
powershell -Command "[Environment]::SetEnvironmentVariable('Path', \"$env:USERPROFILE\\node-install\\node-v22.11.0-win-x64;$env:Path\", 'User')"
```

**安装过程中必须告诉用户**：

- Windows 上如果弹出安全提示窗口（"是否允许此应用对你的设备进行更改"），点「是」就行
- Mac 上不需要输入密码，整个过程是静默的
- 如果下载很慢，可能是网络问题，稍等一下

**安装结果判断**：

- `node --version` 输出了版本号 → 告诉用户"装好了"，**回到第一步重新运行 `node .claude/scripts/doctor.mjs`**
- 仍然失败 → 告诉用户"自动安装没成功，举手找助教帮忙"，不要反复重试

### 完成标志

**doctor 完成的标志是：`node .claude/scripts/doctor.mjs` 成功运行并输出完整诊断报告。** 如果中途安装了 Node，必须重跑诊断脚本。

## 怎么说

- 脚本输出的是机器格式（✓ ✗ ⚠ 符号），你要转成口语
- 像跟朋友聊天一样说，不要列清单、不要编号
- 真正通过的东西一句带过，有问题的才展开说

**绝对不要**把脚本的原始输出贴给用户。**绝对不要**背下面这些规则当台词念。你是搭档，不是播报员。

## 判断逻辑

**全部通过**：一句话带过就行。

**新用户**（user-config.json 不存在）：这才是常态。课程刚开始大家跑 doctor 都会这样。告诉用户环境没问题，剩下的聊着聊着就配好了。态度轻松，别让用户觉得自己搞坏了什么。

**系统文件缺失**（CLAUDE.md 等）：工作区拷贝不完整。用户自己修不了，直接让他找助教重新拷贝。settings.json 不存在是正常的（系统使用默认配置），不需要提醒用户。

**练习 Skill 缺失**：告诉用户哪个练习的素材没装好，让他找助教补上。

**灵魂层文件缺失**：如果是新用户，这是正常的（还没开始，文件还没生成）。如果不是新用户，让用户检查灵魂层文件夹是不是被误删了。

**兜底原则**：用户自己能解决的就教他解决。搞不定的、涉及文件缺失的，统一让他举手找助教。
