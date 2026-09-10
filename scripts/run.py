"""Train matched CNNs, score upright vs rotated, write metrics.json."""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from equivariant.const import FAMILIES, MAX_TEST, MAX_TRAIN, N_TEST, N_TRAIN, SEED
from equivariant.data import (
    check_split,
    make_split,
    require_rotated,
    rotated_test,
    subset,
)
from equivariant.eval import bake_off, family_row, print_report, write_data_ts, write_metrics


def illustrative(blocker: str) -> dict:
    rows = [
        {
            "family": "cnn",
            "attach": "plain_conv",
            "group": "none",
            "params_total": 0,
            "upright_pct": 96.0,
            "rotated_pct": 38.0,
            "aug": False,
        },
        {
            "family": "equivariant",
            "attach": "orientation_pool",
            "group": "C8",
            "params_total": 0,
            "upright_pct": 97.0,
            "rotated_pct": 94.0,
            "aug": False,
        },
        {
            "family": "cnn_aug",
            "attach": "plain_conv",
            "group": "none",
            "params_total": 0,
            "upright_pct": 95.0,
            "rotated_pct": 88.0,
            "aug": True,
        },
    ]
    return bake_off(rows, illustrative=True, blocker=blocker)


def main() -> None:
    try:
        import torch  # noqa: F401
        from equivariant.train import train_family
    except ImportError as e:
        m = illustrative(str(e))
        write_metrics(m)
        print_report(m)
        print("ILLUSTRATIVE")
        print("BLOCKER:", m["blocker"])
        write_data_ts(m)
        return

    split = make_split(N_TRAIN, N_TEST, SEED)
    check_split(split["train_ids"], split["test_ids"])
    if N_TRAIN > MAX_TRAIN or N_TEST > MAX_TEST:
        raise SystemExit("HARD FAIL: cap")
    tr_x, tr_y, _ = subset(split, "train")
    te_x, te_y, _ = subset(split, "test")
    rot_x, _angs = rotated_test(te_x, seed=1)
    require_rotated(te_x, rot_x)

    rows = []
    for name in FAMILIES:
        model = train_family(name, tr_x, tr_y, seed=SEED)
        row = family_row(model, name, te_x, te_y, rot_x)
        rows.append(row)
        print(
            f"{name:<14} upright_pct={row['upright_pct']:.1f} "
            f"rotated_pct={row['rotated_pct']:.1f}"
        )

    m = bake_off(rows)
    if not m["illustrative"] and m["success_pct"] < 85:
        sys.exit(
            f"HARD FAIL: success_pct {m['success_pct']:.1f} < 85 "
            f"(cnn_pct {m['cnn_pct']:.1f} chance_pct {m['chance_pct']:.1f})"
        )
    write_metrics(m)
    print_report(m)
    write_data_ts(m)


if __name__ == "__main__":
    main()
