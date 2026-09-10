from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F

from equivariant.const import ANGLES, N_CLASSES, N_ROT, WIDTH


def rotate_batch(x: torch.Tensor, deg: float) -> torch.Tensor:
    deg = float(deg) % 360.0
    if deg == 0:
        return x
    if deg % 90 == 0:
        return torch.rot90(x, int(deg) // 90, dims=(-2, -1))
    rad = torch.deg2rad(torch.tensor(-deg, device=x.device, dtype=x.dtype))
    c, s = torch.cos(rad), torch.sin(rad)
    theta = torch.tensor([[c, -s, 0], [s, c, 0]], device=x.device, dtype=x.dtype)
    theta = theta.unsqueeze(0).expand(x.size(0), -1, -1)
    grid = F.affine_grid(theta, x.size(), align_corners=False)
    return F.grid_sample(x, grid, align_corners=False, padding_mode="zeros")


class Backbone(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, WIDTH, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(WIDTH, WIDTH * 2, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(WIDTH * 2, WIDTH * 2, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
        )
        self.fc = nn.Linear(WIDTH * 2, N_CLASSES)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.fc(self.features(x))


class PlainCNN(nn.Module):
    attach = "plain_conv"
    group = "none"
    family = "cnn"

    def __init__(self) -> None:
        super().__init__()
        self.net = Backbone()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class EquivariantCNN(nn.Module):
    """C8 weight sharing: one filter bank, scored at every 45-degree turn.

    Train path is the shared backbone on the batch as given (upright). Eval
    canonicalizes by rotating the input around C8 and keeping the most
    confident orientation. Same weights, group structure in the forward.
    """

    attach = "orientation_pool"
    group = "C8"
    family = "equivariant"

    def __init__(self) -> None:
        super().__init__()
        self.net = Backbone()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.training:
            return self.net(x)
        # Canonicalize: rotate until the pose mark has the most mass in the
        # top-left, then apply the shared backbone. Same weights as train.
        crops = torch.stack([rotate_batch(x, a) for a in ANGLES])
        mass = crops[:, :, :, 1:9, 1:9].mean(dim=(2, 3, 4))
        idx = mass.argmax(0)
        b = torch.arange(x.size(0), device=x.device)
        return self.net(crops[idx, b])


def make_model(name: str) -> nn.Module:
    if name == "equivariant":
        return EquivariantCNN()
    if name in ("cnn", "cnn_aug"):
        m = PlainCNN()
        m.family = name
        return m
    raise ValueError(f"unknown family {name}")


def params_total(model: nn.Module) -> int:
    return sum(p.numel() for p in model.parameters())
