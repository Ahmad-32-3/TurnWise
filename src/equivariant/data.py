"""Capped synthetic glyphs. Train upright; test upright + C8 rotations.

Each image has a top-left pose mark and a center class symbol. Rotation is
load-bearing: an identity copy of the upright test is rejected.
"""

from __future__ import annotations

import numpy as np

from equivariant.const import ANGLES, IMG, N_CLASSES, N_TEST, N_TRAIN, SEED


def chance_pct() -> float:
    return 100.0 / N_CLASSES


def rotate_np(img: np.ndarray, deg: float) -> np.ndarray:
    deg = float(deg) % 360.0
    if deg == 0:
        return np.ascontiguousarray(img)
    if deg % 90 == 0:
        return np.ascontiguousarray(np.rot90(img, int(deg) // 90))
    h, w = img.shape
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    th = np.deg2rad(-deg)
    c, s = np.cos(th), np.sin(th)
    yy, xx = np.mgrid[0:h, 0:w]
    y0 = c * (yy - cy) + s * (xx - cx) + cy
    x0 = -s * (yy - cy) + c * (xx - cx) + cx
    x0 = np.clip(x0, 0, w - 1.001)
    y0 = np.clip(y0, 0, h - 1.001)
    x1 = np.floor(x0).astype(np.int32)
    y1 = np.floor(y0).astype(np.int32)
    wx = (x0 - x1).astype(np.float32)
    wy = (y0 - y1).astype(np.float32)
    x2 = np.minimum(x1 + 1, w - 1)
    y2 = np.minimum(y1 + 1, h - 1)
    return (
        img[y1, x1] * (1 - wy) * (1 - wx)
        + img[y1, x2] * (1 - wy) * wx
        + img[y2, x1] * wy * (1 - wx)
        + img[y2, x2] * wy * wx
    ).astype(np.float32)


def _bar(img: np.ndarray, y0: int, x0: int, y1: int, x1: int, t: int = 1) -> None:
    n = int(max(abs(y1 - y0), abs(x1 - x0), 1) * 2)
    ys = np.linspace(y0, y1, n)
    xs = np.linspace(x0, x1, n)
    h, w = img.shape
    for y, x in zip(ys, xs):
        r0, r1 = max(0, int(y) - t), min(h, int(y) + t + 1)
        c0, c1 = max(0, int(x) - t), min(w, int(x) + t + 1)
        img[r0:r1, c0:c1] = 1.0


def _rect(img: np.ndarray, y0: int, x0: int, y1: int, x1: int) -> None:
    img[max(0, y0) : min(IMG, y1), max(0, x0) : min(IMG, x1)] = 1.0


def _glyph(label: int, rng: np.random.Generator) -> np.ndarray:
    """Corner pose mark plus a center symbol.

    The bright block is always top-left at train time. A plain net latches
    onto that corner. C8 eval rotates until the block sits there again, then
    reads the symbol.
    """
    img = np.zeros((IMG, IMG), dtype=np.float32)
    oy, ox = int(rng.integers(-1, 2)), int(rng.integers(-1, 2))
    _rect(img, 2 + oy, 2 + ox, 8 + oy, 8 + ox)
    if label == 0:
        _rect(img, 12, 12, 17, 17)
    elif label == 1:
        _bar(img, 8, 14, 22, 14, 2)
    elif label == 2:
        _bar(img, 14, 8, 14, 20, 2)
    elif label == 3:
        _bar(img, 8, 14, 22, 14, 1)
        _bar(img, 14, 8, 14, 20, 1)
    elif label == 4:
        _rect(img, 10, 10, 19, 19)
        img[12:17, 12:17] = 0.0
    elif label == 5:
        _bar(img, 8, 11, 22, 11, 1)
        _bar(img, 8, 17, 22, 17, 1)
    elif label == 6:
        _bar(img, 9, 9, 20, 20, 1)
    elif label == 7:
        _bar(img, 9, 20, 20, 9, 1)
    elif label == 8:
        _bar(img, 10, 10, 20, 10, 1)
        _bar(img, 20, 10, 20, 18, 1)
        _bar(img, 10, 18, 20, 18, 1)
    else:
        _rect(img, 18, 8, 22, 12)
        _rect(img, 18, 13, 22, 17)
        _rect(img, 18, 18, 22, 22)
    img += rng.normal(0, 0.03, img.shape).astype(np.float32)
    return np.clip(img, 0, 1).astype(np.float32)


def make_split(
    n_train: int = N_TRAIN,
    n_test: int = N_TEST,
    seed: int = SEED,
) -> dict:
    rng = np.random.default_rng(seed)
    n = n_train + n_test
    labels = np.array([i % N_CLASSES for i in range(n)], dtype=np.int64)
    rng.shuffle(labels)
    images = np.stack([_glyph(int(y), rng) for y in labels])
    ids = np.arange(n, dtype=np.int64)
    train_ids, test_ids = ids[:n_train], ids[n_train:]
    return {
        "images": images,
        "labels": labels,
        "ids": ids,
        "train_ids": train_ids,
        "test_ids": test_ids,
        "train_angles": np.zeros(n_train, dtype=np.float32),
    }


def subset(split: dict, which: str) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    idx = split["train_ids"] if which == "train" else split["test_ids"]
    return split["images"][idx], split["labels"][idx], idx


def rotate_set(images: np.ndarray, angles: np.ndarray) -> np.ndarray:
    return np.stack([rotate_np(images[i], float(angles[i])) for i in range(len(images))])


def rotated_test(images: np.ndarray, seed: int = 1) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    angles = rng.choice(np.array(ANGLES, dtype=np.float32), size=len(images))
    return rotate_set(images, angles), angles


def check_split(train_ids: np.ndarray, test_ids: np.ndarray) -> None:
    overlap = set(train_ids.tolist()) & set(test_ids.tolist())
    if overlap:
        raise ValueError(f"leak: {len(overlap)} sample ids in train and test")


def require_rotated(upright: np.ndarray, rotated: np.ndarray) -> None:
    if upright.shape != rotated.shape:
        raise ValueError("shape mismatch")
    if np.allclose(upright, rotated, atol=1e-5):
        raise ValueError("rotated split is identity")
