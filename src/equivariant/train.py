from __future__ import annotations

import numpy as np
import torch

from equivariant.const import ANGLES, BATCH, LR, SEED, STEPS
from equivariant.data import rotate_np
from equivariant.models import make_model


def _batches(images: np.ndarray, labels: np.ndarray, batch: int, rng: np.random.Generator):
    n = len(labels)
    order = rng.permutation(n)
    for i in range(0, n, batch):
        sl = order[i : i + batch]
        yield images[sl], labels[sl]


def train_family(
    name: str,
    images: np.ndarray,
    labels: np.ndarray,
    steps: int = STEPS,
    seed: int = SEED,
):
    torch.manual_seed(seed)
    rng = np.random.default_rng(seed)
    model = make_model(name)
    opt = torch.optim.Adam(model.parameters(), lr=LR)
    model.train()
    step = 0
    while step < steps:
        for xb, yb in _batches(images, labels, BATCH, rng):
            if name == "cnn_aug":
                angs = rng.choice(np.array(ANGLES, dtype=np.float32), size=len(xb))
                xb = np.stack([rotate_np(xb[i], float(angs[i])) for i in range(len(xb))])
            xt = torch.from_numpy(xb[:, None, :, :].astype(np.float32))
            yt = torch.from_numpy(yb.astype(np.int64))
            loss = torch.nn.functional.cross_entropy(model(xt), yt)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            opt.step()
            step += 1
            if step >= steps:
                break
    model.eval()
    return model
