# Caps. Over any of these is a Verify fail.
N_CLASSES = 10
IMG = 28
N_TRAIN = 1000
N_TEST = 200
MAX_TRAIN = 2000
MAX_TEST = 500
STEPS = 80
BATCH = 64
LR = 2e-3
SEED = 0
WIDTH = 24  # first conv channels; second is 2*WIDTH
N_ROT = 8  # C8, 45 degree steps
ANGLES = tuple(range(0, 360, 360 // N_ROT))
FAMILIES = ("cnn", "equivariant", "cnn_aug")
