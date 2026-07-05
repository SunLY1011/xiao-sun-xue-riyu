#!/usr/bin/env python3
"""Install 3.0学员 skill pack → ~/.cursor/skills/ + 项目 .cursor/skills/（按文件夹选型）"""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST_ROOT = Path.home() / ".cursor" / "skills"
PROJECT_SKILLS = ROOT / ".cursor" / "skills"

# 候选源（按优先级）
SRC_CANDIDATES = [
    Path(r"D:\【学习】\【李一舟】\_skills_extract\skills for 3.0学员"),
    Path(r"D:\【学习】\【李一舟】\skills for 3.0学员\skills for 3.0学员"),
    Path(r"D:\【软件】\Skill\skills for 3.0学员\skills for 3.0学员"),
]

# 按 3.0 文件夹 · 标日 H5 工程所需（hyouga-product-pm 路由 + 交付流水线）
PROJECT_SLUGS_BY_FOLDER: dict[str, set[str]] = {
    "01-AI增强": {
        "context-engineering-agent",
        "agent-eval-loop",
        "multi-agent-orchestrator",
        "active-agent",
        "skill-finder",
    },
    "02-内容创作": {
        "advanced-xhs-visual-design",
        "brand-voice-system",
        "hook-angle-lab",
        "course-design-agent",
    },
    "03-开发工具": {
        "repo-context-compiler",
        "code-review-ci",
        "skill-creator",
        "skill-vetter",
    },
    "04-浏览器自动化": {
        "browser-automation",
    },
    "06-知识与学习": {
        "learning-loop",
        "yizhou-thinking",
        "meeting-notes-actions",
    },
    "07-效率工具": {
        "yizhou-ppt",
        "editable-pptx-builder",
        "workflow-automation-builder",
    },
}

PROJECT_SLUGS: set[str] = set().union(*PROJECT_SLUGS_BY_FOLDER.values())

SLUG_RE = re.compile(r"（([^）]+)）\s*$")


def resolve_src() -> Path:
    for p in SRC_CANDIDATES:
        if p.is_dir() and any(p.rglob("SKILL.md")):
            return p
    raise FileNotFoundError(
        "3.0 skill 源未找到。请解压 skills for 3.0学员.zip 到 "
        + str(SRC_CANDIDATES[0].parent)
    )


def slug_from_dir(name: str) -> str:
    m = SLUG_RE.search(name)
    if m:
        return m.group(1).strip()
    safe = re.sub(r"[^\w\-]+", "-", name, flags=re.UNICODE).strip("-").lower()
    return safe or "unnamed-skill"


def copytree_fresh(src: Path, dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def install_all(src_root: Path, dest_root: Path) -> list[str]:
    dest_root.mkdir(parents=True, exist_ok=True)
    installed: list[str] = []
    for skill_md in sorted(src_root.rglob("SKILL.md")):
        src_dir = skill_md.parent
        slug = slug_from_dir(src_dir.name)
        copytree_fresh(src_dir, dest_root / slug)
        installed.append(slug)
    return installed


def main() -> int:
    src = resolve_src()
    PROJECT_SKILLS.mkdir(parents=True, exist_ok=True)

    global_installed = install_all(src, DEST_ROOT)

    project_installed: list[str] = []
    slug_to_dir: dict[str, Path] = {}
    for skill_md in src.rglob("SKILL.md"):
        slug = slug_from_dir(skill_md.parent.name)
        slug_to_dir[slug] = skill_md.parent

    for slug in sorted(PROJECT_SLUGS):
        src_dir = slug_to_dir.get(slug)
        if not src_dir:
            print(f"[WARN] project skill not in pack: {slug}")
            continue
        copytree_fresh(src_dir, PROJECT_SKILLS / slug)
        project_installed.append(slug)

    index_src = src / "INDEX.md"
    if index_src.is_file():
        shutil.copy2(index_src, DEST_ROOT / "yizhou-3.0-skills-INDEX.md")
        shutil.copy2(index_src, ROOT / "docs" / "yizhou-3.0-skills-INDEX.md")

    spec_src = src / "skill撰写规范.md"
    if spec_src.is_file():
        shutil.copy2(spec_src, ROOT / "docs" / "yizhou-3.0-skill撰写规范.md")

    manifest = PROJECT_SKILLS / "PROJECT-SKILLS-INSTALLED.txt"
    lines = [
        f"installed_at: {__import__('datetime').date.today()}",
        f"source: {src}",
        f"global_count: {len(global_installed)}",
        f"project_count: {len(project_installed)}",
        "",
        "[project]",
        *project_installed,
        "",
        "[global_all]",
        *global_installed,
    ]
    manifest.write_text("\n".join(lines), encoding="utf-8")

    (DEST_ROOT / "yizhou-3.0-installed.txt").write_text(
        "\n".join([f"source: {src}", f"count: {len(global_installed)}", "", *global_installed]),
        encoding="utf-8",
    )

    print(f"[OK] global {len(global_installed)} skills -> {DEST_ROOT}")
    print(f"[OK] project {len(project_installed)} skills -> {PROJECT_SKILLS}")
    print(f"[OK] manifest -> {manifest.relative_to(ROOT)} (machine list; see PROJECT-SKILLS-MANIFEST.md)")
    missing = sorted(PROJECT_SLUGS - set(project_installed))
    if missing:
        print(f"[WARN] missing project slugs: {missing}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
