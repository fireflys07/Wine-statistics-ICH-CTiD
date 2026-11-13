"""Reproducible holdout split; full duplicate rows stay together."""
import hashlib
import json

import numpy as np
import pandas as pd

COLUMNS = [
    'fixed_acidity', 'volatile_acidity', 'citric_acid', 'residual_sugar',
    'chlorides', 'free_sulfur_dioxide', 'total_sulfur_dioxide', 'density',
    'pH', 'sulphates', 'alcohol', 'quality', 'wine_type',
]


def split_wines(frame, test_fraction=0.2, seed=42):
    """Split groups separately by wine type; fraction refers to groups, not rows.

    row_id is the 1-based data row within each original color CSV (no header).
    Input must preserve the original CSV order. All observations are retained.
    """
    if not 0 < test_fraction < 1:
        raise ValueError('test_fraction must lie strictly between 0 and 1')
    data = frame[COLUMNS].copy().reset_index(drop=True)
    if data.isna().any().any():
        raise ValueError('Missing values require an explicit handling policy')
    numeric = data.drop(columns='wine_type')
    if not np.isfinite(numeric.to_numpy(dtype=float)).all():
        raise ValueError('Numeric values must be finite')
    if not data.wine_type.isin(['red', 'white']).all():
        raise ValueError('Expected red or white wine_type')
    if not ((data.quality % 1 == 0) & data.quality.between(0, 10)).all():
        raise ValueError('quality must be an integer in [0, 10]')
    if not data.alcohol.between(0, 100).all():
        raise ValueError('alcohol must be in [0, 100] percent by volume')
    # Normalize numeric representation before hashing, including signed zero.
    def fingerprint(row):
        values = [0.0 if float(x) == 0 else float(x) for x in row[:-1]]
        payload = json.dumps(values + [row[-1]], separators=(',', ':'))
        return hashlib.sha256(payload.encode()).hexdigest()
    groups = data.apply(lambda row: fingerprint(row.tolist()), axis=1)
    manifest = pd.DataFrame({
        'row_id': data.wine_type + ':' + (data.groupby('wine_type').cumcount() + 1).astype(str),
        'group_id': groups,
        'wine_type': data.wine_type,
        'split': 'train',
    })
    rng = np.random.default_rng(seed)
    for kind in sorted(data.wine_type.unique()):
        unique = np.sort(groups[data.wine_type == kind].unique())
        if len(unique) < 2:
            raise ValueError('Each wine type needs at least two distinct groups')
        n_test = min(len(unique) - 1, max(1, round(len(unique) * test_fraction)))
        selected = rng.permutation(unique)[:n_test]
        manifest.loc[manifest.group_id.isin(selected), 'split'] = 'test'
    return manifest


def model_parts(frame, manifest):
    """Return X/y with alcohol as the sole predictor, in manifest order."""
    if len(frame) != len(manifest):
        raise ValueError('Frame and manifest lengths differ')
    return {
        part: (frame.reset_index(drop=True).loc[manifest.split.eq(part).to_numpy(), ['alcohol']].copy(),
               frame.reset_index(drop=True).loc[manifest.split.eq(part).to_numpy(), 'quality'].copy())
        for part in ('train', 'test')
    }
