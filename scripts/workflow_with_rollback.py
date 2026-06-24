#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""十阶段工作流状态机：阶段检查、回退、workflow_status.json。"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WF_DEF = ROOT / "docs" / "workflow_definition.json"
STATUS_FILE = ROOT / "workflow_status.json"
SNAP_DIR = ROOT / ".workflow_snapshots"


def load_def() -> dict:
    with WF_DEF.open(encoding="utf-8") as f:
        return json.load(f)


def load_status() -> dict:
    if STATUS_FILE.is_file():
        with STATUS_FILE.open(encoding="utf-8") as f:
            return json.load(f)
    return {
        "workflow_name": "strict_mvp_rollback_pipeline",
        "current_stage_id": 0,
        "retries": {},
        "rollbacks": 0,
        "history": [],
        "updated_at": None,
    }


def save_status(st: dict) -> None:
    st["updated_at"] = datetime.now(timezone.utc).isoformat()
    STATUS_FILE.write_text(json.dumps(st, ensure_ascii=False, indent=2), encoding="utf-8")


def check_goal() -> tuple[bool, str]:
    p = ROOT / "goal.txt"
    if not p.is_file():
        return False, "缺少 goal.txt"
    t = p.read_text(encoding="utf-8")
    keys = ["做什么", "为谁", "验收"]
    missing = [k for k in keys if k not in t]
    if missing:
        return False, f"goal.txt 缺少关键词: {missing}"
    return True, "OK"


def check_agents() -> tuple[bool, str]:
    p = ROOT / "AGENTS.md"
    if not p.is_file():
        return False, "缺少 AGENTS.md"
    t = p.read_text(encoding="utf-8")
    need = ["交付前", "文递自归", "笔记"]
    if not all(n in t for n in need[:2]):
        return False, "AGENTS.md 未链到交付/文递自归"
    return True, "OK"


def check_init() -> tuple[bool, str]:
    ps1 = ROOT / "scripts" / "init-check.ps1"
    bat = ROOT / "发布前自检.bat"
    py = ROOT / "scripts" / "pre-ship-check.py"
    if ps1.is_file():
        r = subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps1)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
        )
        if r.returncode == 0:
            return True, "init-check.ps1 OK"
        return False, (r.stdout or "") + (r.stderr or "")
    if py.is_file():
        r = subprocess.run([sys.executable, str(py)], cwd=str(ROOT), capture_output=True, text=True)
        if r.returncode == 0:
            return True, "pre-ship-check OK"
        return False, (r.stdout or "")[-800:]
    if bat.is_file():
        return False, "请运行 发布前自检.bat 或安装 init-check.ps1"
    return False, "无初始化检查脚本"


def check_completion() -> tuple[bool, str]:
    p = ROOT / "completion_snapshot.txt"
    if not p.is_file():
        return False, "缺少 completion_snapshot.txt"
    return True, "OK"


def check_feedback() -> tuple[bool, str]:
    p = ROOT / "feedback.md"
    if not p.is_file():
        return False, "缺少 feedback.md"
    t = p.read_text(encoding="utf-8")
    for k in ["自检", "cache", "链接"]:
        if k not in t:
            return False, f"feedback.md 缺少: {k}"
    return True, "OK"


def check_progress() -> tuple[bool, str]:
    p = ROOT / "claude-progress.md"
    if not p.is_file():
        return False, "缺少 claude-progress.md"
    return True, "OK"


CHECKERS = {
    1: check_goal,
    2: check_agents,
    3: check_init,
    5: check_completion,
    9: check_feedback,
    10: check_progress,
}


def run_check(stage_id: int) -> tuple[bool, str]:
    fn = CHECKERS.get(stage_id)
    if fn:
        return fn()
    return True, "本阶段由 Agent 人工核对（无自动检查器）"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--init", action="store_true", help="重置 workflow_status.json")
    ap.add_argument("--status", action="store_true", help="打印状态")
    ap.add_argument("--stage", type=int, help="设置当前阶段并运行检查")
    ap.add_argument("--run-check", action="store_true")
    ap.add_argument("--advance", action="store_true", help="检查通过后前进")
    ap.add_argument("--rollback-to", type=int, help="回退到指定阶段 id")
    args = ap.parse_args()

    wf = load_def()
    st = load_status()

    if args.init:
        st = load_status()
        st["current_stage_id"] = 1
        st["retries"] = {}
        st["rollbacks"] = 0
        st["history"] = [{"event": "init", "at": datetime.now(timezone.utc).isoformat()}]
        save_status(st)
        print("[OK] workflow 已初始化，当前阶段=1")
        return 0

    if args.status:
        print(json.dumps(st, ensure_ascii=False, indent=2))
        return 0

    if args.rollback_to is not None:
        st["current_stage_id"] = args.rollback_to
        st["rollbacks"] = st.get("rollbacks", 0) + 1
        st["history"].append({"event": "rollback", "to": args.rollback_to})
        save_status(st)
        print(f"[OK] 已回退到阶段 {args.rollback_to}")
        return 0

    if args.stage:
        st["current_stage_id"] = args.stage

    sid = st.get("current_stage_id") or 1
    stage = next((s for s in wf["stages"] if s["id"] == sid), None)
    if not stage:
        print(f"[FAIL] 未知阶段 {sid}")
        return 1

    if args.run_check or args.advance:
        ok, msg = run_check(sid)
        print(f"阶段 {sid} {stage['name']}: {'PASS' if ok else 'FAIL'} — {msg}")
        if not ok:
            retries = st["retries"].get(str(sid), 0) + 1
            st["retries"][str(sid)] = retries
            max_r = wf.get("rollback_policy", {}).get("max_retries_per_stage", 3)
            if retries > max_r and stage.get("rollback_target"):
                st["current_stage_id"] = stage["rollback_target"]
                st["rollbacks"] = st.get("rollbacks", 0) + 1
                print(f"[rollback] -> 阶段 {stage['rollback_target']}")
            save_status(st)
            return 1
        if args.advance:
            st["current_stage_id"] = sid + 1
            st["retries"][str(sid)] = 0
            st["history"].append({"event": "advance", "from": sid, "to": sid + 1})
        save_status(st)
        return 0

    print("用法: --init | --status | --stage N --run-check | --stage N --run-check --advance | --rollback-to N")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
