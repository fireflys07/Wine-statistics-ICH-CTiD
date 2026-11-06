"""Conditional empirical quality generator using inverse CDF."""
import numpy as np
from .regression import vector


def quality_distribution(x_train, y_train, alcohol, k=720):
    """Estimate score probabilities among neighbors, including boundary ties."""
    x, y = vector(x_train), vector(y_train)
    if x.shape != y.shape:
        raise ValueError('Training arrays must have the same length')
    if np.any((y != np.floor(y)) | (y < 0) | (y > 10)):
        raise ValueError('Quality must contain integer scores in [0, 10]')
    if not np.isscalar(alcohol) or not np.isfinite(alcohol) or not x.min() <= alcohol <= x.max():
        raise ValueError('Alcohol must be within the training range')
    if isinstance(k, bool) or not isinstance(k, (int, np.integer)) or not 1 <= k <= len(x):
        raise ValueError('Invalid k')
    distance = np.abs(x - alcohol)
    radius = np.partition(distance, k - 1)[k - 1]
    neighbors = y[(distance <= radius) | np.isclose(distance, radius, rtol=1e-12, atol=1e-12)]
    scores, counts = np.unique(neighbors.astype(int), return_counts=True)
    return scores, counts / counts.sum()


def inverse_cdf(scores, probabilities, uniforms):
    """Map U in [0, 1) to discrete scores; zero-mass intervals are skipped."""
    scores, probabilities = vector(scores), vector(probabilities)
    u = np.asarray(uniforms, dtype=float)
    if scores.shape != probabilities.shape or np.any(np.diff(scores) <= 0):
        raise ValueError('Scores must be distinct and increasing')
    if np.any(scores != np.floor(scores)) or np.any((scores < 0) | (scores > 10)):
        raise ValueError('Invalid scores')
    if np.any(probabilities < 0) or not np.isclose(probabilities.sum(), 1, rtol=0, atol=1e-12):
        raise ValueError('Probabilities must be nonnegative and sum to 1')
    if not np.isfinite(u).all() or np.any((u < 0) | (u >= 1)):
        raise ValueError('Uniform values must lie in [0, 1)')
    cdf = np.cumsum(probabilities / probabilities.sum())
    cdf[-1] = 1.
    return scores[np.searchsorted(cdf, u, side='right')].astype(int)


def generate_quality(x_train, y_train, alcohol, size, k=720, seed=None):
    """Generate scores; reuse a numpy Generator to continue its random stream."""
    if isinstance(size, bool) or not isinstance(size, (int, np.integer)) or size < 0:
        raise ValueError('size must be a nonnegative integer')
    scores, probabilities = quality_distribution(x_train, y_train, alcohol, k)
    rng = np.random.default_rng(seed)
    return inverse_cdf(scores, probabilities, rng.random(size))
