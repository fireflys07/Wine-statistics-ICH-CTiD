import unittest
import numpy as np
from wine_stats.regression import predict_knn

class KnnTests(unittest.TestCase):
    def test_nearest(self):
        np.testing.assert_allclose(predict_knn([0,2,5],[1,3,8],[0.1,4.9],1),[1,8])
    def test_ties_and_order(self):
        x=np.array([0,2,2,4]);y=np.array([1,3,5,9])
        np.testing.assert_allclose(predict_knn(x,y,[1],1),[3])
        np.testing.assert_allclose(predict_knn(x,y,[1,3],2),predict_knn(x[::-1],y[::-1],[1,3],2))
    def test_all_neighbors(self):
        np.testing.assert_allclose(predict_knn([0,1,2],[2,4,9],[-10,10],3),[5,5])
    def test_invalid_k(self):
        for k in [0,4,1.5,True]:
            with self.assertRaises(ValueError): predict_knn([1,2,3],[4,5,6],[2],k)
