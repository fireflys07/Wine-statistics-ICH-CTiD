"""Shared plot defaults for the assembled report."""
import matplotlib.pyplot as plt
from cycler import cycler


def use_style():
    plt.rcParams.update({
        "figure.figsize": (9, 5), "figure.dpi": 110,
        "font.family": "DejaVu Sans", "font.size": 11,
        "axes.grid": True, "grid.alpha": 0.25,
        "axes.spines.top": False, "axes.spines.right": False,
        "axes.prop_cycle": cycler(color=["#A66A80", "#B9A16B", "#477E9E", "#52545A"]),
    })
