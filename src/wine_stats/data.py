"""Load the two original UCI CSV files without silently cleaning observations."""
from pathlib import Path
import pandas as pd


def load_wines(data_dir):
    frames = []
    for kind in ("red", "white"):
        path = Path(data_dir) / f"winequality-{kind}.csv"
        if not path.is_file():
            raise FileNotFoundError(f"Missing {path}. See data/README.md")
        frame = pd.read_csv(path, sep=";")
        frame.columns = frame.columns.str.strip().str.replace(" ", "_", regex=False)
        required = {"quality", "alcohol", "volatile_acidity"}
        if not required.issubset(frame.columns):
            raise ValueError(f"Unexpected columns in {path}: {list(frame.columns)}")
        frame["wine_type"] = kind
        frames.append(frame)
    return pd.concat(frames, ignore_index=True)
