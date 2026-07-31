---
name: text-to-visual
description: 文本可视化——把文字内容转换成精美的 HTML 视觉页面。调性：克制、透气、有温度。适用于复盘文档、培训总结、知识卡片、内容分享等场景。用户说"做成网页""变成图片""做成卡片页""文本可视化""图片化"时触发。
---

# 文本可视化 · HTML 页面生成器

将文字内容转换成一个视觉精美的单文件 HTML 页面。风格调性：**克制、透气、有温度**——不是科技发布会，不是企业内训模板，更接近一个精心设计的产品界面。

---

## 工作流程

### 第一步：分析内容结构

识别标题层级、分节、引用、列表等结构，为每个内容区块选择合适的布局模式（见下方布局模式）。

### 第二步：生成 HTML

单文件，CSS 内嵌，Google Fonts CDN 引入。严格遵循下方配色、排版、组件规范。

### 第三步：质检

生成 HTML 后，对照以下清单逐项检查代码：

| # | 检查项 | 通过标准 |
|---|--------|----------|
| 1 | 孤字折行 | 没有任何一行末尾只剩 1-2 个字 |
| 2 | 光晕合理 | 相邻卡片光晕颜色不同，无过密 |
| 3 | 图标规范 | 全部是 SVG 线性图标，无 emoji |
| 4 | 英文展示字体 | 技术名词/产品名用了 `.accent-en` |
| 5 | 字号层级 | H1 > H2 > H3 > Body > Small |
| 6 | 纯黑检查 | 无 `#000` 或 `black`，用 `#2D2D2D` |
| 7 | 响应式 | 移动端双列变单列，字号 clamp 生效 |

发现问题即修改，修改后再过一遍清单。

---

## 配色体系

### CSS 变量

```css
:root {
  --accent: #E8735A;          /* 珊瑚/暖橘，主强调 */
  --accent-purple: #8B7EC8;   /* 柔紫，辅助强调 */
  --accent-green: #7EC88B;    /* 柔绿，第三强调 */
  --accent-blue: #5BA8D5;     /* 柔蓝，备用 */
  --text-primary: #2D2D2D;    /* 标题文字 */
  --text-secondary: #555;     /* 正文文字 */
  --text-muted: #888;         /* 备注文字 */
  --border-subtle: rgba(0,0,0,0.06);
  --card-bg: rgba(255,255,255,0.58);
  --card-border: rgba(255,255,255,0.45);
  --radius: 18px;
  --font-body: 'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif;
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Menlo', monospace;
}
```

### 背景

薄荷绿→浅桃粉渐变（左上到右下），极淡，像水汽覆在纸上：

```css
background: linear-gradient(135deg,
  hsla(170, 40%, 95%, 0.6) 0%,
  hsla(40, 20%, 97%, 0.4) 50%,
  hsla(10, 50%, 95%, 0.5) 100%);
background-attachment: fixed;
```

### 禁区

- 不用纯黑文字（用 `#2D2D2D` 或 `#333`）
- 不用高饱和大色块
- 不用渐变色文字
- 不用深色背景（全程 light mode）
- **不用 emoji**——一律用 inline SVG 线性图标

---

## 排版体系

### 字体

| 用途 | 字体 | 引入方式 |
|------|------|----------|
| 中文 | Noto Sans SC / PingFang SC | Google Fonts CDN |
| 英文展示 | DM Serif Display | Google Fonts CDN |
| 代码 | SF Mono / JetBrains Mono | 系统字体栈 |

**英文展示字体**用于需要视觉重量的英文词——产品名、技术名词、平台名。样式：`color: var(--accent); font-family: var(--font-display);`，对应 CSS 类 `.accent-en`。

### 字号层级

| 层级 | 用途 | 值 | 字重 | 颜色 |
|------|------|------|------|------|
| H1 | 页面主标题 | `clamp(2.4rem, 5vw, 3.6rem)` | 700 | `--text-primary` |
| H2 | 节标题 | `clamp(1.6rem, 3vw, 2.2rem)` | 600 | `--text-primary` |
| H3 | 卡片标题 | `clamp(1.2rem, 2.2vw, 1.55rem)` | 600 | `--text-primary` |
| Body | 正文 | `clamp(0.92rem, 1.3vw, 1.05rem)` | 400 | `--text-secondary` |
| Small | 备注 | `0.85rem` | 400 | `--text-muted` |

### 折行控制

**硬规则：任何正文行不允许出现尾部 1-2 个字独占一行。** 在 HTML 中用 `<br>` 在语义断点处主动折行。

断点选择：破折号后 > 逗号后 > 句号后 > 结构词前。超 20 个中文字必须主动设断点。

---

## 组件库

### 磨砂玻璃卡片

```css
.card {
  background: rgba(255,255,255,0.58);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.45);
  border-radius: 18px;
  padding: 36px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04),
              inset 0 1px 0 rgba(255,255,255,0.4);
}
```

### 卡片光晕

四种颜色：`.glow-coral`、`.glow-purple`、`.glow-green`、`.glow-blue`。每种通过 `::before`（左上，110px，blur 32px，opacity 0.22）和 `::after`（右下，80px，blur 25px，opacity 0.12）实现双侧光晕。卡片必须 `position:relative; overflow:hidden` 裁切光晕。

同一页面内多张卡片的光晕颜色应有差异，避免视觉重复。

### 引用块

用于原文摘录、语录引用：

```css
.quote-block {
  border-left: 3px solid var(--accent);
  background: rgba(232,115,90,0.04);
  border-radius: 0 12px 12px 0;
  padding: 16px 20px;
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--text-secondary);
}
```

可变色：`.purple` 用紫色边框，绿色用内联 style。

### 改进建议列表

绿色圆点标识，用于"下次改进"类行动项：

```css
.next-label { color: var(--accent-green); font-weight: 600; }
.next-label::before { /* 8px 绿色圆点 */ }
.improve-list li::before { /* 6px 绿色圆点 */ }
```

### 装饰性磨砂色块（Blob）

为整体页面添加氛围。2-3 个 `position:fixed` 圆形色块：

| 属性 | 值 |
|------|------|
| 尺寸 | 380-440px |
| blur | 78-85px |
| opacity | 0.20-0.25 |
| z-index | -1 |
| 配色 | purple + coral + green 错位放置 |

### SVG 图标

- 44×44px，1.5px 描边
- 颜色取自 CSS 变量（`--accent`、`--accent-purple`、`--accent-green`）
- 线性风格，不用 filled，不用双色
- 根据内容语义选择图标（网络、金钱、终端、设备、时钟、心形等）

---

## 布局模式

### A. 满屏标题

用于 Hero 区域。标题居中，大字号，背景仅有装饰 blob。

### B. 单列叙事

卡片纵向堆叠，每张卡片内：图标+标题 → 描述 → 引用块 → 改进建议。适合内容丰富的主题。

### C. 双列卡片网格

`grid-template-columns: 1fr 1fr`，gap 20px。适合并列展示多个主题，每张卡片信息量相当。移动端自动变为单列。

### D. 节标题分隔

左侧 6px 彩色圆点 + H2 标题，用于分隔大章节。

---

## 页面结构模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>/* CSS 变量 + 组件样式 */</style>
</head>
<body>
  <!-- 装饰 blob ×3 -->
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>

  <div class="page-wrapper"> <!-- max-width:960px, 水平居中 -->
    <header class="hero"><!-- 标题 + 副标题 --></header>

    <div class="section-header"><h2>节标题</h2></div>
    <div class="card glow-coral"><!-- 卡片内容 --></div>
    <div class="card-grid-2"><!-- 双列卡片 --></div>

    <footer class="footer"><!-- 页脚 --></footer>
  </div>
</body>
</html>
```

---