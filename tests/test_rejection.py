import unittest
import numpy as np
from wine_stats.generator import rejection_sample


class RejectionTests(unittest.TestCase):
    def test_degenerate_and_empty(self):
        sample, attempts = rejection_sample([6], [1], 100, seed=4)
        np.testing.assert_array_equal(sample, np.full(100, 6))
        self.assertEqual(attempts, 100)
        sample, attempts = rejection_sample([6], [1], 0, seed=4)
        self.assertEqual(sample.size, 0)
        self.assertEqual(attempts, 0)

    def test_frequencies_and_zero_mass(self):
        p = np.array([0, .2, .5, .3])
        scores = np.array([3, 4, 6, 8])
        sample, attempts = rejection_sample(scores, p, 100000, seed=42)
        frequencies = np.array([(sample == q).mean() for q in scores])
        self.assertEqual(frequencies[0], 0)
        self.assertTrue(np.all(np.abs(frequencies[1:] - p[1:]) <
                               6 * np.sqrt(p[1:] * (1-p[1:]) / len(sample))))
        self.assertGreaterEqual(attempts, len(sample))
        self.assertAlmostEqual(len(sample) / attempts, 1/(len(p)*p.max()), delta=.01)

    def test_reproducibility(self):
        a, attempts = rejection_sample([4, 6, 8], [.2, .5, .3], 1000, seed=42)
        b, again = rejection_sample([4, 6, 8], [.2, .5, .3], 1000, seed=42)
        np.testing.assert_array_equal(a, b)
        self.assertEqual(attempts, again)
        c, _ = rejection_sample([4, 6, 8], [.2, .5, .3], 1000, seed=43)
        self.assertFalse(np.array_equal(a, c))

    def test_invalid(self):
        for size in [-1, True, 1.5]:
            with self.assertRaises(ValueError):
                rejection_sample([6], [1], size)
        for p in [[.1, .2], [-.1, 1.1], [float('nan'), 1]]:
            with self.assertRaises(ValueError):
                rejection_sample([4, 6], p, 10)
