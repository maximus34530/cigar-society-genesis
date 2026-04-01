#!/usr/bin/env python3
"""Parse Toast-style cigar export from stdin; emit src/data/cigars.ts to stdout."""
from __future__ import annotations

import json
import re
import sys
from typing import Any

PRICE_RE = re.compile(r"^\$\d")


def parse(lines: list[str]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line in ("Search", "Cigars"):
            i += 1
            continue
        if line == "Retail" and i + 1 < len(lines) and lines[i + 1] == "Cigars":
            i += 2
            continue
        if line == "Cut Fee":
            break
        name = line
        i += 1
        desc_parts: list[str] = []
        while i < len(lines) and lines[i] != "OUT OF STOCK" and not PRICE_RE.match(lines[i]):
            desc_parts.append(lines[i])
            i += 1
        in_stock = True
        if i < len(lines) and lines[i] == "OUT OF STOCK":
            in_stock = False
            i += 1
        if i >= len(lines):
            break
        price = lines[i]
        i += 1
        if not price.startswith("$"):
            continue
        desc_joined = "\n".join(desc_parts).strip()
        items.append(
            {
                "name": name,
                "price": price,
                "inStock": in_stock,
                **({"description": desc_joined} if desc_joined else {}),
            }
        )
    return items


def main() -> None:
    raw = sys.stdin.read()
    lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
    items = parse(lines)
    out: list[dict[str, Any]] = []
    for idx, it in enumerate(items, start=1):
        row = {"id": f"cigar-{idx}", **it}
        out.append(row)
    ts = (
        'import type { CigarProduct } from "@/lib/cigarTypes";\n\n'
        "export const cigars: CigarProduct[] = "
        + json.dumps(out, ensure_ascii=False, indent=2)
        + ";\n"
    )
    sys.stdout.write(ts)


if __name__ == "__main__":
    main()
