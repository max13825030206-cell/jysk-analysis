#!/usr/bin/env python3
"""
优化的 PDF 转 Markdown 脚本
功能：
1. 去除页码和特殊符号
2. 合并错误换行（PDF 中被拆分的段落）
3. 自动识别标题层级（一、二、三；（一）（二））
4. 保留列表项格式
5. 处理表格
"""

import sys
import re
import pdfplumber

def clean_and_format_pdf(pdf_path, md_path):
    """将 PDF 转换为格式化的 Markdown"""

    with pdfplumber.open(pdf_path) as pdf:
        full_text = ''
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + '\n'

    # 预处理：去除页码、星号等
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    # 过滤页码：纯数字、"1 / 15"格式、星号
    lines = [l for l in lines if not re.match(r'^\d+$', l) and
             not re.match(r'^\d+\s*/\s*\d+$', l) and
             l != '★']

    result = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # 文档编号（如：华人【2025】14 号）
        if re.match(r'^华人【\d+】', line) or re.match(r'^[\w]+【\d+】', line):
            result.append(f'# {line}\n')
            i += 1
            continue

        # 主标题（含"通知"、"方案"等）
        if any(keyword in line for keyword in ['通知', '方案', '决定', '公告']) and len(line) < 50 and i < 5:
            result.append(f'# {line}\n')
            i += 1
            continue

        # 一级标题（一、二、三）
        if re.match(r'^[一二三四五六七八九十]+、', line):
            result.append(f'## {line}\n')
            i += 1
            continue

        # 二级标题（（一）（二））
        if re.match(r'^（[一二三四五六七八九十]+）', line):
            # 合并后续内容直到遇到句号或新标题/列表
            buffer = line
            i += 1
            while i < len(lines):
                next_line = lines[i]
                # 如果遇到新的标题或列表，停止
                if (re.match(r'^[一二三四五六七八九十]+、', next_line) or
                    re.match(r'^（[一二三四五六七八九十]+）', next_line) or
                    re.match(r'^\d+\.|^[①②③④⑤⑥⑦⑧⑨]', next_line)):
                    break
                buffer += next_line
                i += 1
                # 如果遇到句号，停止
                if buffer.endswith('。'):
                    break
            result.append(f'### {buffer}\n')
            continue

        # 列表项（1. 2. 或 ①②③）
        if re.match(r'^\d+\.|^[①②③④⑤⑥⑦⑧⑨]', line):
            buffer = line
            i += 1
            # 向后合并直到遇到句号或新段落
            while i < len(lines):
                next_line = lines[i]
                # 遇到新的标题或列表项，停止
                if (re.match(r'^[一二三四五六七八九十]+、', next_line) or
                    re.match(r'^（[一二三四五六七八九十]+）', next_line) or
                    re.match(r'^\d+\.|^[①②③④⑤⑥⑦⑧⑨]', next_line)):
                    break
                buffer += next_line
                i += 1
                # 如果遇到句号，检查下一行是否是新段落
                if buffer.endswith('。'):
                    break
            result.append(buffer + '\n')
            continue

        # 普通段落：合并多行直到遇到句号或新段落标志
        buffer = line
        i += 1
        while i < len(lines):
            next_line = lines[i]

            # 遇到标题或列表，停止
            if (re.match(r'^[一二三四五六七八九十]+、', next_line) or
                re.match(r'^（[一二三四五六七八九十]+）', next_line) or
                re.match(r'^\d+\.|^[①②③④⑤⑥⑦⑧⑨]', next_line)):
                break

            # 如果buffer已经以句号结尾，且下一行以关键词开头或很长，认为是新段落
            if buffer.endswith('。'):
                # 如果下一行以常见段落开头词开始，或长度超过30，认为是新段落
                if (re.match(r'^(为|集团|公司|负责|统筹|主导|扎口|税务|资产|管理|作为|根据|经|特此|在|进一步|通过|建立|完善|强化|深化|推动|加强)', next_line) or
                    len(next_line) > 30):
                    break

            # 如果buffer以冒号结尾，下一行可能是新段落
            if buffer.endswith('：') and len(next_line) > 20:
                buffer += '\n\n' + next_line
                i += 1
                continue

            # 否则拼接
            buffer += next_line
            i += 1

            # 如果已经很长且以句号结尾，可以结束
            if len(buffer) > 100 and buffer.endswith('。'):
                break

        result.append(buffer + '\n')

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(result))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('用法: python3 convert_to_md.py <输入.pdf> <输出.md>')
        sys.exit(1)

    pdf_path = sys.argv[1]
    md_path = sys.argv[2]

    clean_and_format_pdf(pdf_path, md_path)
    print(f'已转换: {md_path}')
