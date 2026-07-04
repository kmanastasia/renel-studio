#!/usr/bin/env python3
"""renel-studio ローカルリンク検査。
全HTML内の href/src が指すローカルファイルの存在を確認する。
使い方: python3 tools/check_links.py  （リポジトリのどこから実行してもよい）
終了コード: 0=全リンク存在 / 1=欠損あり（欠損一覧を表示）
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIR_NAMES = {".git", "outputs", "node_modules", "tools"}
# chemistry-match はビルド成果物のコピーのため検査対象外
SKIP_SUBTREES = [ROOT / "self-projects" / "chemistry-match"]
ATTR_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)
EXTERNAL_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "data:", "#", "javascript:")

def main():
    missing = []
    for html in sorted(ROOT.rglob("*.html")):
        if any(p.name in SKIP_DIR_NAMES for p in html.parents):
            continue
        if any(html.is_relative_to(s) for s in SKIP_SUBTREES):
            continue
        text = html.read_text(encoding="utf-8")
        for m in ATTR_RE.finditer(text):
            raw = m.group(1)
            if raw.startswith(EXTERNAL_PREFIXES):
                continue
            url = raw.split("#")[0].split("?")[0]
            if not url:
                continue
            target = (html.parent / url).resolve()
            ok = target.is_file() or (target.is_dir() and (target / "index.html").is_file())
            if not ok:
                missing.append(f"{html.relative_to(ROOT)} -> {raw}")
    if missing:
        print("MISSING:")
        print("\n".join(missing))
        sys.exit(1)
    print("OK: all local href/src targets exist")
    sys.exit(0)

if __name__ == "__main__":
    main()
