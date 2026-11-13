"""Export the executed notebook for reading, with long code cells hidden."""
from pathlib import Path
import re
import nbformat
from nbconvert import HTMLExporter
from traitlets.config import Config

ROOT = Path(__file__).resolve().parents[1]
notebook = nbformat.read(ROOT / "notebooks/Lab01.ipynb", as_version=4)
for cell in notebook.cells:
    if cell.cell_type == "markdown":
        cell.source = re.sub(r"\]\((sprint[12]/[^)]+)\)",
                             r"](../notebooks/\1)", cell.source)
config = Config()
config.TagRemovePreprocessor.enabled = True
config.TagRemovePreprocessor.remove_input_tags = {"hide-input"}
body, _ = HTMLExporter(config=config).from_notebook_node(notebook)
target = ROOT / "reports/Lab01.html"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(body, encoding="utf-8")
print(f"Сохранён {target}")
