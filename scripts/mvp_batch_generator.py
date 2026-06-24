#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量复制标准 MVP 目录结构并按映射规则生成新产品白板。"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RULES = ROOT / "docs" / "mvp_mapping_rules.json"
EXAMPLE_RULES = ROOT / "docs" / "mvp_mapping_rules.example.json"


def load_rules(path: Path) -> dict:
    if not path.is_file():
        if EXAMPLE_RULES.is_file():
            print(f"[warn] 使用示例规则: {EXAMPLE_RULES}")
            path = EXAMPLE_RULES
        else:
            raise FileNotFoundError(f"映射规则不存在: {path}")
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def should_skip(rel: str, exclude_globs: list[str]) -> bool:
    parts = rel.replace("\\", "/").split("/")
    joined = "/".join(parts)
    for pat in exclude_globs:
        pat = pat.replace("**", "").strip("/")
        if pat and (joined.startswith(pat) or f"/{pat}/" in f"/{joined}/"):
            return True
    return False


def copy_tree_filtered(src: Path, dst: Path, exclude_globs: list[str]) -> list[str]:
    copied = []
    for root, dirs, files in os.walk(src):
        rel_root = Path(root).relative_to(src)
        if should_skip(str(rel_root), exclude_globs):
            dirs[:] = []
            continue
        dirs[:] = [d for d in dirs if not should_skip(str(rel_root / d), exclude_globs)]
        for name in files:
            rel = rel_root / name
            if should_skip(str(rel), exclude_globs):
                continue
            src_f = Path(root) / name
            dst_f = dst / rel
            dst_f.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_f, dst_f)
            copied.append(str(rel).replace("\\", "/"))
    return copied


def apply_mapping(file_path: Path, product_name: str, rules: dict) -> bool:
    exts = set(rules.get("file_include_extensions") or [])
    if exts and file_path.suffix.lower() not in {e.lower() for e in exts}:
        return False
    try:
        text = file_path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return False
    new_text = text
    for rule in rules.get("replacements", []):
        to_val = rule.get("to", "")
        to_val = to_val.replace("{{PRODUCT_NAME}}", product_name)
        new_text = new_text.replace(rule.get("from", ""), to_val)
    new_text = re.sub(r"\{\{PRODUCT_NAME\}\}", product_name, new_text)
    if new_text != text:
        file_path.write_text(new_text, encoding="utf-8")
        return True
    return False


def generate_product(
    source: Path,
    target_base: Path,
    product_name: str,
    rules: dict,
    exclude_globs: list[str],
) -> dict:
    target = target_base / product_name
    if target.exists():
        shutil.rmtree(target)
    files = copy_tree_filtered(source, target, exclude_globs)
    mapped = 0
    for rel in files:
        fp = target / rel
        if fp.is_file() and apply_mapping(fp, product_name, rules):
            mapped += 1
    return {
        "product": product_name,
        "path": str(target.relative_to(ROOT)),
        "files_copied": len(files),
        "files_mapped": mapped,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="批量生成 MVP 产品白板")
    ap.add_argument("--source", default=os.environ.get("MVP_PATH", str(ROOT)))
    ap.add_argument("--target", default=str(ROOT / "generated_products"))
    ap.add_argument("--rules", default=str(DEFAULT_RULES))
    ap.add_argument("--products", required=True, help="逗号分隔产品 slug，如 a,b,c")
    args = ap.parse_args()

    source = Path(args.source).resolve()
    target_base = Path(args.target).resolve()
    rules = load_rules(Path(args.rules))
    wf = ROOT / "docs" / "workflow_definition.json"
    exclude = rules.get("exclude_globs") or []
    if wf.is_file():
        with wf.open(encoding="utf-8") as f:
            exclude = json.load(f).get("batch_mvp_config", {}).get("exclude_globs", exclude)

    products = [p.strip() for p in args.products.split(",") if p.strip()]
    if not source.is_dir():
        print(f"[FAIL] 标准 MVP 路径不存在: {source}")
        return 1

    target_base.mkdir(parents=True, exist_ok=True)
    manifest = {"source_mvp": str(source), "products": []}
    for name in products:
        entry = generate_product(source, target_base, name, rules, exclude)
        manifest["products"].append(entry)
        print(f"[OK] {entry['path']} ({entry['files_copied']} files, {entry['files_mapped']} mapped)")

    manifest_path = target_base / "products_manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] manifest -> {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
