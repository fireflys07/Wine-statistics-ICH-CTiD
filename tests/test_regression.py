import unittest
import numpy as np
from wine_stats.regression import fit_linear, regression_metrics


class RegressionTests(unittest.TestCase):
    def test_exact_line(self):
        a, b = fit_linear([1, 2, 3, 4], [5, 8, 11, 14])
        self.assertAlmostEqual(a, 2)
        self.assertAlmostEqual(b, 3)

    def test_independent_lstsq_reference(self):
        x = np.array([8., 9., 10., 12., 14.])
        y = np.array([4., 6., 5., 7., 6.])
        reference = np.linalg.lstsq(np.column_stack([np.ones(len(x)), x]), y, rcond=None)[0]
        np.testing.assert_allclose(fit_linear(x, y), reference)

    def test_metrics_by_hand(self):
        metrics = regression_metrics([1, 2, 3], [2, 2, 2])
        self.assertAlmostEqual(metrics['MAE'], 2 / 3)
        self.assertAlmostEqual(metrics['RMSE'], np.sqrt(2 / 3))
        self.assertEqual(metrics['R2'], 0)
        self.assertTrue(np.isnan(regression_metrics([2, 2], [2, 2])['R2']))

    def test_invalid_inputs(self):
        for x, y in [([], []), ([1, 1], [2, 3]), ([1, 2], [3]), ([1, np.nan], [2, 3])]:
            with self.assertRaises(ValueError):
                fit_linear(x, y)
        with self.assertRaises(ValueError):
            regression_metrics([1, 2], [1])
