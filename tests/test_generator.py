import unittest
import numpy as np
from wine_stats.generator import quality_distribution, inverse_cdf, generate_quality
from wine_stats.regression import predict_knn


class GeneratorTests(unittest.TestCase):
    def test_boundaries(self):
        np.testing.assert_array_equal(
            inverse_cdf([3,4,5,6],[0,.25,0,.75],[0,.249999,.25,.99999]),[4,4,6,6])

    def test_neighbor_mean(self):
        x=[9,10,10,11,12];y=[4,5,7,6,8]
        scores,p=quality_distribution(x,y,10,2)
        self.assertAlmostEqual(float(scores@p),float(predict_knn(x,y,[10],2)[0]))

    def test_reproducibility_and_support(self):
        args=([9,10,11],[4,6,8],10,100)
        a=generate_quality(*args,k=3,seed=42)
        np.testing.assert_array_equal(a,generate_quality(*args,k=3,seed=42))
        self.assertFalse(np.array_equal(a,generate_quality(*args,k=3,seed=43)))
        self.assertTrue(set(a)<=set([4,6,8]))
        self.assertEqual(generate_quality([9,10],[4,6],9,0,k=1).size,0)

    def test_frequency_accuracy(self):
        # Six standard errors; fixed seed, no dependence on real dataset.
        p=np.array([.2,.5,.3]);scores=np.array([4,6,8]);size=100000
        sample=inverse_cdf(scores,p,np.random.default_rng(42).random(size))
        observed=np.array([(sample==score).mean() for score in scores])
        self.assertTrue(np.all(np.abs(observed-p)<6*np.sqrt(p*(1-p)/size)))

    def test_invalid(self):
        with self.assertRaises(ValueError): inverse_cdf([4,6],[.2,.2],[.1])
        with self.assertRaises(ValueError): inverse_cdf([4,6],[.5,.5],[1])
        with self.assertRaises(ValueError): generate_quality([9,10],[4,6],12,10,k=1)
        with self.assertRaises(ValueError): generate_quality([9,10],[4,6],9,-1,k=1)
