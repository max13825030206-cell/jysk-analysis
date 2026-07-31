#!/usr/bin/env python3
"""
优化的 DOCX 转 Markdown 脚本
功能：
1. 保留加粗、斜体等格式
2. 合并相同格式的连续文本（避免 **** 问题）
3. 自动识别标题层级
4. 处理表格
"""

import sys
from docx import Document

def process_runs(runs):
    """处理runs并合并相同格式的文本"""
    if not runs:
        return ''

    result = []
    current_text = ''
    current_bold = None
    current_italic = None

    for run in runs:
        text = run.text
        if not text:
            continue

        bold = run.bold
        italic = run.italic

        # 如果格式相同，累积文本
        if bold == current_bold and italic == current_italic:
            current_text += text
        else:
            # 格式不同，先输出之前累积的文本
            if current_text:
                if current_bold:
                    current_text = f'**{current_text}**'
                if current_italic:
                    current_text = f'*{current_text}*'
                result.append(current_text)

            # 开始新的累积
            current_text = text
            current_bold = bold
            current_italic = italic

    # 输出最后累积的文本
    if current_text:
        if current_bold:
            current_text = f'**{current_text}**'
        if current_italic:
            current_text = f'*{current_text}*'
        result.append(current_text)

    return ''.join(result)

def convert_docx_to_md(docx_path, md_path):
    """将 DOCX 转换为格式化的 Markdown"""
    doc = Document(docx_path)
    md_content = []

    for para in doc.paragraphs:
        if not para.text.strip():
            md_content.append('')
            continue

        full_text = process_runs(para.runs)

        # 根据段落样式判断标题级别
        style = para.style.name
        if 'Heading 1' in style or '标题 1' in style:
            md_content.append(f'# {full_text}')
        elif 'Heading 2' in style or '标题 2' in style:
            md_content.append(f'## {full_text}')
        elif 'Heading 3' in style or '标题 3' in style:
            md_content.append(f'### {full_text}')
        elif 'Heading 4' in style or '标题 4' in style:
            md_content.append(f'#### {full_text}')
        else:
            md_content.append(full_text)

    # 处理表格
    for table in doc.tables:
        md_content.append('')
        for i, row in enumerate(table.rows):
            cells = []
            for cell in row.cells:
                cell_text = []
                for para in cell.paragraphs:
                    cell_text.append(process_runs(para.runs))
                cells.append(''.join(cell_text).strip())

            md_content.append('| ' + ' | '.join(cells) + ' |')
            if i == 0:
                md_content.append('| ' + ' | '.join(['---'] * len(cells)) + ' |')
        md_content.append('')

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md_content))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('用法: python3 convert_to_md.py <输入.docx> <输出.md>')
        sys.exit(1)

    docx_path = sys.argv[1]
    md_path = sys.argv[2]

    convert_docx_to_md(docx_path, md_path)
    print(f'已转换: {md_path}')
