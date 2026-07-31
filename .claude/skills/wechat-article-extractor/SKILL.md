---
name: wechat-article-extractor
description: Extract WeChat Official Account articles as clean Markdown. Use when user shares a mp.weixin.qq.com URL or asks to read/extract a WeChat article. Returns title, author, publish time, and content with images and links preserved.
---

# WeChat Article Extractor

提取微信公众号文章，输出干净的 Markdown。

## 用法

```bash
# 默认输出：标题 + 作者 + 发布时间 + Markdown 正文（保留图片和超链接）
node scripts/read.js "<公众号文章URL>"

# JSON 格式输出
node scripts/read.js "<公众号文章URL>" --json
```

脚本位置：`~/.agents/skills/wechat-article-extractor/scripts/read.js`

## 输出示例

```markdown
# 文章标题

**作者**: 作者名
**发布时间**: 2026/03/10 21:51:13

---

正文内容...

![](https://mmbiz.qpic.cn/...)

**加粗文本保留**

[链接文本](https://...)
```

## JSON 模式输出

```json
{
  "title": "文章标题",
  "author": "作者名",
  "publish_time": "2026/03/10 21:51:13",
  "content": "Markdown 正文"
}
```

## 依赖

cheerio, dayjs, request-promise, qs, lodash.unescape（已安装）

## 注意

- 支持文章类型：普通文章、视频、图片、语音、转载
- 自动处理：删文、过期、违规、迁移等异常
- 访问频繁时会被限速（code 1004），稍等重试即可
