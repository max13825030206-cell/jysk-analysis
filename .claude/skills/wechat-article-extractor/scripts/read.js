#!/usr/bin/env node
/**
 * 公众号文章提取 → 干净 Markdown
 * 用法: node read.js <url> [--json]
 * 输出: 标题 + 作者 + 发布时间 + 正文(Markdown)，保留超链接和图片
 */
const { extract } = require('./extract.js');
const cheerio = require('cheerio');

function htmlToMarkdown(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  let md = '';

  function processNode(node) {
    if (node.type === 'text') {
      const text = node.data.replace(/\s+/g, ' ');
      if (text.trim()) md += text;
      return;
    }
    if (node.type !== 'tag') return;

    const $el = $(node);
    const tag = node.tagName?.toLowerCase();

    switch (tag) {
      case 'h1':
        md += '\n# ' + $el.text().trim() + '\n\n';
        break;
      case 'h2':
        md += '\n## ' + $el.text().trim() + '\n\n';
        break;
      case 'h3':
        md += '\n### ' + $el.text().trim() + '\n\n';
        break;
      case 'h4':
        md += '\n#### ' + $el.text().trim() + '\n\n';
        break;
      case 'p':
        processInline($el);
        md += '\n\n';
        break;
      case 'br':
        md += '\n';
        break;
      case 'blockquote':
        const bqLines = [];
        $el.children().each((_, child) => {
          const prev = md;
          md = '';
          processNode(child);
          bqLines.push(md.trim());
          md = prev;
        });
        if (bqLines.filter(Boolean).length) {
          md += '\n' + bqLines.filter(Boolean).map(l => '> ' + l).join('\n> \n') + '\n\n';
        }
        break;
      case 'ul':
        md += '\n';
        $el.children('li').each((_, li) => {
          const prev = md; md = '';
          processInline($(li));
          const item = md.trim(); md = prev;
          if (item) md += '- ' + item + '\n';
        });
        md += '\n';
        break;
      case 'ol':
        md += '\n';
        $el.children('li').each((i, li) => {
          const prev = md; md = '';
          processInline($(li));
          const item = md.trim(); md = prev;
          if (item) md += (i + 1) + '. ' + item + '\n';
        });
        md += '\n';
        break;
      case 'img': {
        const src = $el.attr('data-src') || $el.attr('src');
        if (src && src.startsWith('http')) {
          const alt = $el.attr('alt') || '';
          md += '\n![' + alt + '](' + src + ')\n\n';
        }
        break;
      }
      case 'a': {
        const href = $el.attr('href');
        const text = $el.text().trim();
        if (href && href.startsWith('http') && text) {
          md += '[' + text + '](' + href + ')';
        } else if (text) {
          md += text;
        }
        break;
      }
      case 'strong':
      case 'b':
        const boldText = $el.text().trim();
        if (boldText) md += '**' + boldText + '**';
        break;
      case 'em':
      case 'i':
        const emText = $el.text().trim();
        if (emText) md += '*' + emText + '*';
        break;
      case 'code':
        const codeText = $el.text().trim();
        if (codeText) md += '`' + codeText + '`';
        break;
      case 'pre': {
        const code = $el.find('code').text() || $el.text();
        if (code.trim()) md += '\n```\n' + code.trim() + '\n```\n\n';
        break;
      }
      case 'hr':
        md += '\n---\n\n';
        break;
      case 'figure':
      case 'section':
      case 'div':
      case 'center':
      case 'span':
        // 递归处理容器元素
        $el.contents().each((_, child) => processNode(child));
        break;
      default:
        // 未识别的标签，取文本
        const fallback = $el.text().trim();
        if (fallback) md += fallback;
    }
  }

  function processInline($el) {
    $el.contents().each((_, child) => {
      if (child.type === 'text') {
        md += child.data;
      } else {
        processNode(child);
      }
    });
  }

  // 从 #js_content 或 body 开始
  const root = $('body');
  root.contents().each((_, child) => processNode(child));

  // 清理多余空行
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

async function main() {
  const args = process.argv.slice(2);
  const url = args.find(a => a.startsWith('http'));
  const jsonMode = args.includes('--json');

  if (!url) {
    console.error('用法: node read.js <公众号文章URL> [--json]');
    process.exit(1);
  }

  const result = await extract(url);

  if (!result.done) {
    console.error('提取失败:', result.msg || result.code);
    process.exit(1);
  }

  const d = result.data;
  const content = d.msg_content ? htmlToMarkdown(d.msg_content) : '';

  if (jsonMode) {
    console.log(JSON.stringify({
      title: d.msg_title,
      author: d.msg_author || d.account_name,
      publish_time: d.msg_publish_time_str,
      content
    }, null, 2));
  } else {
    console.log(`# ${d.msg_title}\n`);
    console.log(`**作者**: ${d.msg_author || d.account_name || '未知'}`);
    console.log(`**发布时间**: ${d.msg_publish_time_str || '未知'}\n`);
    console.log('---\n');
    console.log(content);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
