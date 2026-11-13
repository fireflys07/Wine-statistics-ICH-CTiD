"""Execute notebooks in fresh kernels and save outputs only after success."""
import argparse
from pathlib import Path
import nbformat
from nbclient import NotebookClient

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("notebooks", nargs="*", default=["notebooks/Lab01.ipynb"])
    args = parser.parse_args()
    for name in args.notebooks:
        path = (ROOT / name).resolve()
        notebook = nbformat.read(path, as_version=4)
        notebook.nbformat_minor = max(notebook.nbformat_minor, 5)
        print(f"Запуск: {path.relative_to(ROOT)}", flush=True)
        client = NotebookClient(notebook, timeout=600, kernel_name="python3",
                                resources={"metadata": {"path": str(path.parent)}})
        client.execute()
        nbformat.validate(notebook)
        nbformat.write(notebook, path)
        print(f"Готово: {path.relative_to(ROOT)}", flush=True)


if __name__ == "__main__":
    main()
