"""Parse all 24 PRD lesson files and generate JS code for lessons-mvp-depth.js"""

import re
import os
from pathlib import Path

ROOT = Path(r"D:\【私人】\【小王】\日语学习")
PRD_DIR = ROOT / "【产品PRD】" / "新增补课文内容"

# lessonId -> PRD file mapping
LESSON_FILES = {
    1:  PRD_DIR / "第1单元" / "第1单元第01课.txt",
    2:  PRD_DIR / "第1单元" / "第1单元第02课.txt",
    3:  PRD_DIR / "第1单元" / "第1单元第03课.txt",
    4:  PRD_DIR / "第1单元" / "第1单元第04课.txt",
    5:  PRD_DIR / "第2单元" / "第2单元第05课.txt",
    6:  PRD_DIR / "第2单元" / "第2单元第06课.txt",
    7:  PRD_DIR / "第2单元" / "第2单元第07课.txt",
    8:  PRD_DIR / "第2单元" / "第2单元第08课.txt",
    9:  PRD_DIR / "第3单元" / "第3单元第09课.txt",
    10: PRD_DIR / "第3单元" / "第3单元第10课.txt",
    11: PRD_DIR / "第3单元" / "第3单元第11课.txt",
    12: PRD_DIR / "第3单元" / "第3单元第12课.txt",
    13: PRD_DIR / "第4单元" / "第4单元13课.txt",
    14: PRD_DIR / "第4单元" / "第4单元14课.txt",
    15: PRD_DIR / "第4单元" / "第4单元15课.txt",
    16: PRD_DIR / "第4单元" / "第4单元16课.txt",
    17: PRD_DIR / "第5单元" / "第5单元第17课.txt",
    18: PRD_DIR / "第5单元" / "第5单元第18课.txt",
    19: PRD_DIR / "第5单元" / "第5单元第19课.txt",
    20: PRD_DIR / "第5单元" / "第5单元第20课.txt",
    21: PRD_DIR / "第6单元" / "第6单元第21课.txt",
    22: PRD_DIR / "第6单元" / "第6单元第22课.txt",
    23: PRD_DIR / "第6单元" / "第6单元第23课.txt",
    24: PRD_DIR / "第6单元" / "第6单元第24课.txt",
}

def parse_nodes(text):
    """Extract grammar nodes from a PRD lesson text."""
    nodes = []
    # Split by "ノード" markers
    parts = re.split(r'ノード(\d+)[：:]', text)
    # parts: [before, id1, content1, id2, content2, ...]
    for i in range(1, len(parts)-1, 2):
        node_id = int(parts[i])
        content = parts[i+1]
        node = {
            'id': node_id,
            'title': '',
            'explainZh': '',
            'exampleZh': [],
            'pattern': '',
            'note': '',
        }
        lines = content.split('\n')
        # First line is the title (after "ノードN：")
        if lines:
            node['title'] = lines[0].strip()
        # Extract fields
        for j, line in enumerate(lines):
            # Pattern
            m = re.match(r'句型[：:]\s*(.*)', line)
            if m:
                node['pattern'] = m.group(1).strip()
            # Meaning/explainZh
            m = re.match(r'意义[：:]\s*(.*)', line)
            if m:
                node['explainZh'] = m.group(1).strip()
            # Note
            m = re.match(r'注意[：:]\s*(.*)', line)
            if m:
                node['note'] += m.group(1).strip() + ' '
            # Examples: lines like "日文 → 中文" after "例句："
            if line.strip().startswith('例句：') or line.strip() == '例句：':
                # Collect following lines that have "→"
                k = j + 1
                while k < len(lines):
                    ex_line = lines[k].strip()
                    ex_m = re.match(r'.*[→].*\s+(.+)', ex_line)
                    if ex_m:
                        node['exampleZh'].append(ex_m.group(1).strip())
                    elif ex_line == '':
                        pass
                    elif re.match(r'ノード\d+', ex_line):
                        break
                    elif ex_line.startswith('用法') or ex_line.startswith('【'):
                        break
                    elif ex_line.startswith('句型') or ex_line.startswith('意义') or ex_line.startswith('注意'):
                        break
                    k += 1
        node['note'] = node['note'].strip()
        nodes.append(node)
    return nodes

def extract_summary_block(text):
    """Extract これまでのまとめ section."""
    m = re.search(r'📖\s*これまでのまとめ\s*\n(.+?)(?=\n🗂️|\n📝|\Z)', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return ''

def extract_dialogue_key_points(text):
    """Extract 会話のキーポイント section."""
    m = re.search(r'会話のキーポイント[（(][会话要点)][）)]\s*\n(.+?)(?=\nロールプレイ|\n【作业】|\Z)', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return ''

def extract_role_play_tasks(text):
    """Extract ロールプレイ課題 section."""
    m = re.search(r'ロールプレイ課題[（(][角色扮演)][）)]\s*\n(.+?)(?=\n【作业】|\Z)', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return ''

def extract_basic_text(text):
    """Extract basic text (4 core sentences)."""
    lines = []
    in_basic = False
    for line in text.split('\n'):
        if '基本课文' in line or '基本課文' in line:
            in_basic = True
            continue
        if in_basic:
            if line.strip() == '':
                continue
            if '应用课文' in line or '场景' in line or '人物' in line or '【' in line:
                break
            if not line.startswith('（') and not line.startswith('「'):
                if '→' not in line:
                    lines.append(line.strip())
    return '\n'.join(lines[:8])

def extract_homework_sections(text):
    """Extract homework assignments."""
    parts = re.split(r'\d+\.\s*', text)
    sections = []
    for p in parts[1:]:  # Skip the part before first number
        lines = p.strip().split('\n')
        name = lines[0].strip()
        content_lines = [l.strip() for l in lines[1:] if l.strip() and not l.startswith('Q') and not l.startswith('→')]
        content = '\n'.join(content_lines[:3])  # First 3 meaningful lines
        if name:
            sections.append({'name': name, 'content': content})
    return sections

def gen_js_grammar_explain_zh(all_nodes):
    """Generate GRAMMAR_EXPLAIN_ZH constant."""
    parts = []
    for lesson_id in range(1, 25):
        nodes = all_nodes.get(lesson_id, [])
        entries = []
        for n in nodes:
            if n['explainZh']:
                explain_escaped = n['explainZh'].replace("'", "\\'")
                title_part = n['title'].split('（')[0].strip()
                entries.append(f"    '{lesson_id}.{n['id']}': '({title_part}) {explain_escaped}'")
        if entries:
            parts.append(f"  {lesson_id}: {{\n" + ",\n".join(entries) + "\n  }")
    return "const GRAMMAR_EXPLAIN_ZH = {\n" + ",\n".join(parts) + "\n};"

def gen_js_grammar_example_zh(all_nodes):
    """Generate GRAMMAR_EXAMPLE_ZH constant."""
    parts = []
    for lesson_id in range(1, 25):
        nodes = all_nodes.get(lesson_id, [])
        entries = []
        for n in nodes:
            if n['exampleZh']:
                exs = ", ".join([f"'{e.replace(chr(39), chr(39)+chr(39)+chr(39))}'" for e in n['exampleZh']])
                entries.append(f"    '{lesson_id}.{n['id']}': [{exs}]")
        if entries:
            parts.append(f"  {lesson_id}: {{\n" + ",\n".join(entries) + "\n  }")
    return "const GRAMMAR_EXAMPLE_ZH = {\n" + ",\n".join(parts) + "\n};"

def gen_js_depth_patch(all_nodes, all_summaries, all_dialogue_pts, all_role_play, all_basic_texts):
    """Generate LESSON_DEPTH_PATCH entries for lessons 2-24."""
    parts = []
    for lesson_id in range(2, 25):
        nodes = all_nodes.get(lesson_id, [])
        if not nodes:
            continue
        node_patches = []
        for n in nodes:
            entries = []
            # titleZh: split "〜は〜です（名词谓语句・肯定）" -> "名词谓语句・肯定"
            title_zh = ''
            m = re.match(r'.*（(.+)）', n['title'])
            if m:
                title_zh = m.group(1)
            if title_zh:
                entries.append(f"        titleZh: '{title_zh}'")
            if n.get('explainZh'):
                entries.append(f"        explanationZh: '({n['title'].split('（')[0].strip()}) {n['explainZh'].replace(chr(39), chr(39)+chr(39)+chr(39))}'")
            if n.get('exampleZh'):
                exs = ', '.join([f"'{e.replace(chr(39), chr(39)+chr(39)+chr(39))}'" for e in n['exampleZh'][:3]])
                entries.append(f"        exampleZh: [{exs}]")
            if entries:
                node_patches.append(f"    {n['id']}: {{\n" + ",\n".join(entries) + "\n    }")
        
        coach = ''
        if all_summaries.get(lesson_id):
            s = all_summaries[lesson_id][:200]
            coach = s.replace("'", "\\'")
        
        if node_patches:
            patch = f"  {lesson_id}: {{\n    nodePatches: {{\n" + ",\n".join(node_patches) + "\n    }"
            if coach:
                patch += f",\n    lessonCoachSummary: `{coach}`"
            patch += "\n  }"
            parts.append(patch)
    
    return "const LESSON_DEPTH_PATCH = {\n" + ",\n".join(parts) + "\n};"


# Main
all_nodes = {}
all_summaries = {}
all_dialogue_pts = {}
all_role_play = {}
all_basic_texts = {}

for lesson_id, path in LESSON_FILES.items():
    if not path.exists():
        print(f"WARN: {path} not found")
        continue
    text = path.read_text(encoding='utf-8')
    
    nodes = parse_nodes(text)
    all_nodes[lesson_id] = nodes
    
    summary = extract_summary_block(text)
    if summary:
        all_summaries[lesson_id] = summary
    
    dp = extract_dialogue_key_points(text)
    if dp:
        all_dialogue_pts[lesson_id] = dp
    
    rp = extract_role_play_tasks(text)
    if rp:
        all_role_play[lesson_id] = rp
    
    bt = extract_basic_text(text)
    if bt:
        all_basic_texts[lesson_id] = bt
    
    print(f"Lesson {lesson_id}: {len(nodes)} nodes")

# Generate JS code
js_lines = []
js_lines.append("// ===== AUTO-GENERATED FROM PRD FILES =====")
js_lines.append("// Run: python scripts/sync-all-supplement-data.py")
js_lines.append("")

# GRAMMAR_EXPLAIN_ZH
js_lines.append(gen_js_grammar_explain_zh(all_nodes))
js_lines.append("")

# GRAMMAR_EXAMPLE_ZH
js_lines.append(gen_js_grammar_example_zh(all_nodes))
js_lines.append("")

# LESSON_DEPTH_PATCH entries for 2-24
js_lines.append(gen_js_depth_patch(all_nodes, all_summaries, all_dialogue_pts, all_role_play, all_basic_texts))
js_lines.append("")

output = "\n".join(js_lines)

# Write to temp file for review
out_path = ROOT / "scripts" / "_generated_supplement_data.js"
out_path.write_text(output, encoding='utf-8')
print(f"\nGenerated: {out_path} ({len(output)} bytes)")
print(f"Done.")
