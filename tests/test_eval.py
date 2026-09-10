import numpy as np
import pytest

from equivariant.const import N_CLASSES, N_TEST, N_TRAIN
from equivariant.data import (
    chance_pct,
    check_split,
    make_split,
    require_rotated,
    rotate_np,
    rotated_test,
    subset,
)


def test_chance_is_uniform_over_classes():
    assert chance_pct() == pytest.approx(100.0 / N_CLASSES)


def test_rotate_changes_pixels():
    split = make_split(40, 20, seed=0)
    img = split["images"][0]
    rot = rotate_np(img, 90)
    assert not np.allclose(img, rot)


def test_identity_only_control_fails():
    split = make_split(40, 20, seed=0)
    te, _, _ = subset(split, "test")
    with pytest.raises(ValueError, match="identity"):
        require_rotated(te, te.copy())


def test_rotated_split_is_not_identity():
    split = make_split(40, 20, seed=0)
    te, _, _ = subset(split, "test")
    rot, angs = rotated_test(te, seed=1)
    assert not np.allclose(angs, 0)
    require_rotated(te, rot)


def test_train_test_ids_are_disjoint():
    split = make_split(N_TRAIN, N_TEST, seed=0)
    check_split(split["train_ids"], split["test_ids"])
    assert len(split["train_ids"]) == N_TRAIN
    assert len(split["test_ids"]) == N_TEST


def test_mixing_rotated_test_into_train_is_caught():
    split = make_split(40, 20, seed=0)
    leaked = np.concatenate([split["train_ids"], split["test_ids"]])
    with pytest.raises(ValueError, match="leak"):
        check_split(leaked, split["test_ids"])


def test_caps_match_design():
    from equivariant.const import MAX_TEST, MAX_TRAIN

    assert N_TRAIN <= MAX_TRAIN
    assert N_TEST <= MAX_TEST
    assert N_CLASSES <= 10


def test_short_train_equivariant_beats_plain_on_rotated():
    pytest.importorskip("torch")
    from equivariant.eval import accuracy
    from equivariant.train import train_family

    split = make_split(320, 80, seed=0)
    tr_x, tr_y, _ = subset(split, "train")
    te_x, te_y, _ = subset(split, "test")
    rot_x, _ = rotated_test(te_x, seed=1)
    require_rotated(te_x, rot_x)
    cnn = train_family("cnn", tr_x, tr_y, steps=40, seed=0)
    eq = train_family("equivariant", tr_x, tr_y, steps=40, seed=0)
    cnn_rot = accuracy(cnn, rot_x, te_y)
    eq_rot = accuracy(eq, rot_x, te_y)
    assert eq_rot > cnn_rot
