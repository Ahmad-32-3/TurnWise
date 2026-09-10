# TurnWise

Photos of the same mark can sit upright or turned. I only train on upright pictures. Then I rotate the test pictures and ask the model to name the mark anyway.

A plain image network often fails because it latched onto which way is up. I also train a network built so those turns count as the same thing. The score I care about is how often the name is still right after the turn.

Headline is equivariant (or steerable) accuracy on rotated test, printed next to a plain CNN on the same rotated set and a chance baseline. Same train budget for both nets. This is a bake-off of putting rotation into the weights versus hoping a plain net generalizes.

## Data

Small image set with discrete classes (MNIST / Fashion-MNIST or a capped scientific set). Train mostly upright. Test upright and rotated.

## Run

```bash
python -m pytest tests/ -q
python scripts/run.py
npm --prefix web install
npm --prefix web run dev
```

`scripts/run.py` prints rotated accuracy for the equivariant model next to the plain CNN and chance.

## Layout

- `src/` models and eval
- `scripts/run.py`
- `tests/` rotated test mixed into train labels must fail
- `web/` architecture chart and upright vs rotated results
