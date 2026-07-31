# Customer Analysis Toolkit

B2B 客户自动分析系统 — 爬取、富化、分析、可视化一站式流水线。

## 快速开始

```bash
# 1. 爬取产品数据（通过 WooCommerce REST API）
node src/cli.mjs scrape --customer jysk --target bathroom

# 2. 富化材质/规格数据（逐产品页提取 Material 字段）
node src/cli.mjs enrich --customer jysk --target bathroom

# 3. 运行分析（价格带、品类、材质、机会缺口）
node src/cli.mjs analyze --customer jysk --target bathroom

# 4. 生成 HTML 看板
node src/cli.mjs dashboard --customer jysk --target bathroom

# 5. 一键全流程（周更模式）
node src/cli.mjs weekly --customer jysk --target bathroom
```

## 命令说明

| 命令 | 功能 | 输出 |
|------|------|------|
| `scrape` | 爬取产品列表 | `_data/{customer}_{target}.json` |
| `enrich` | 补充材质/规格 | `_data/{customer}_{target}_enriched.json` |
| `analyze` | 价格带/品类/材质分析 | `_data/{customer}_{target}_analysis.json` |
| `diff` | 周环比（新增/下架/变价） | `_data/{customer}_{target}_diff.json` |
| `dashboard` | 生成 HTML 看板 | `output/{customer}_{target}_dashboard.html` |
| `weekly` | 全流程一键跑 | 以上全部 |
| `list` | 列出可用客户配置 | — |

## 目录结构

```
customer-analysis/
├── configs/                 # 客户配置文件
│   └── jysk.json           # JYSK 配置（URL、价格带、材质关键词）
├── src/
│   ├── cli.mjs             # CLI 入口
│   ├── scraper.mjs         # WooCommerce API 爬虫
│   ├── browser-scraper.mjs # 浏览器爬虫（CI 用，完整 sticker 数据）
│   ├── enricher.mjs        # 产品详情页材质提取
│   ├── analyzer.mjs        # 分析引擎
│   ├── differ.mjs          # 周环比对比
│   └── dashboard.mjs       # HTML 看板生成器
├── _data/                  # 中间数据（JSON）
├── _snapshots/             # 历史快照（用于 diff）
└── output/                 # 最终输出（HTML 看板）
```

## 添加新客户

在 `configs/` 下创建 `{customer-name}.json`：

```json
{
  "name": "Retailer Name",
  "baseUrl": "https://retailer.com",
  "type": "woocommerce",
  "currency": "EUR",
  "currencySymbol": "€",
  "targets": [
    {
      "id": "category-id",
      "label": "Category Label",
      "path": "/parent/category-path",
      "subcategoryKeywords": ["keyword1", "keyword2"]
    }
  ],
  "materialKeywords": { ... },
  "priceBands": { ... }
}
```

## GitHub Actions 集成

```yaml
- name: Scrape & analyze
  run: |
    cd 00_专注区/customer-analysis
    node src/cli.mjs weekly --customer jysk --target bathroom
```

也可用 browser-scraper（需要 agent-browser）获取完整 sticker 数据：

```yaml
- name: Browser scrape
  run: |
    npm install -g agent-browser && agent-browser install
    cd 00_专注区/customer-analysis
    node src/browser-scraper.mjs --customer jysk --target bathroom
```
