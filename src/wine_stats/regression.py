"""Single-feature least squares and regression metrics, without sklearn."""
import numpy as np


def vector(values):
    result = np.asarray(values, dtype=float)
    if result.ndim != 1 or result.size == 0 or not np.isfinite(result).all():
        raise ValueError('Expected a nonempty finite one-dimensional array')
    return result


def fit_linear(x, y):
    """Return intercept, slope for y ~ intercept + slope*x."""
    x, y = vector(x), vector(y)
    if x.shape != y.shape:
        raise ValueError('x and y must have the same length')
    centered = x - x.mean()
    denominator = centered @ centered
    if denominator == 0:
        raise ValueError('Cannot estimate slope for constant x')
    slope = (centered @ (y - y.mean())) / denominator
    return float(y.mean() - slope * x.mean()), float(slope)


def regression_metrics(y, prediction):
    """R² is undefined (NaN) when the observed target is constant."""
    y, prediction = vector(y), vector(prediction)
    if y.shape != prediction.shape:
        raise ValueError('Observations and predictions must have the same length')
    residual = y - prediction
    total = ((y - y.mean()) ** 2).sum()
    return {'MAE': float(np.abs(residual).mean()),
            'RMSE': float(np.sqrt((residual ** 2).mean())),
            'R2': float(1 - (residual ** 2).sum() / total) if total > 0 else float('nan')}


def predict_knn(x_train, y_train, x_query, k):
    """Uniform kNN; include every neighbor tied at the kth distance."""
    x, y, query = vector(x_train), vector(y_train), vector(x_query)
    if x.shape != y.shape:
        raise ValueError('Training arrays must have the same length')
    if isinstance(k, bool) or not isinstance(k, (int, np.integer)) or not 1 <= k <= len(x):
        raise ValueError('k must be an integer between 1 and training size')
    predictions = []
    for value in query:
        distances = np.abs(x - value)
        radius = np.partition(distances, k - 1)[k - 1]
        # Tolerance covers floating-point roundoff, not measurement rounding.
        mask = (distances <= radius) | np.isclose(distances, radius, rtol=1e-12, atol=1e-12)
        predictions.append(y[mask].mean())
    return np.array(predictions)
