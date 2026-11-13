"""Run with PYTHONPATH=src python -m unittest discover -s tests -v."""
import unittest
import pandas as pd
from wine_stats.split import COLUMNS, split_wines, model_parts


class SplitTests(unittest.TestCase):
    def setUp(self):
        rows = []
        for kind in ('red', 'white'):
            for i in range(30):
                row = [float(i + 1)] * 11 + [5, kind]
                row[10] = 10.0  # Same alcohol/quality must NOT collapse all groups.
                rows.extend([row] * (1 + i % 3))
        self.frame = pd.DataFrame(rows, columns=COLUMNS)

    def test_integrity(self):
        m = split_wines(self.frame)
        self.assertEqual(len(m), len(self.frame))
        self.assertTrue(m.row_id.is_unique)
        self.assertEqual(m.groupby('group_id').split.nunique().max(), 1)
        self.assertEqual(m.group_id.nunique(), 60)
        self.assertEqual(set(m.split), {'train', 'test'})
        for x, y in model_parts(self.frame, m).values():
            self.assertEqual(list(x.columns), ['alcohol'])
            self.assertEqual(len(x), len(y))
        self.assertEqual(set(m.wine_type), {'red', 'white'})

    def test_repeatability(self):
        pd.testing.assert_frame_equal(split_wines(self.frame), split_wines(self.frame))
        self.assertFalse(split_wines(self.frame).equals(split_wines(self.frame, seed=43)))

    def test_invalid_input(self):
        for fraction in (0, 1, -0.1):
            with self.assertRaises(ValueError):
                split_wines(self.frame, test_fraction=fraction)
        self.frame.loc[0, 'alcohol'] = float('nan')
        with self.assertRaises(ValueError):
            split_wines(self.frame)


if __name__ == '__main__':
    unittest.main()
