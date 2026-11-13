"""Download the original UCI files and verify their contents."""
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
URL = "https://archive.ics.uci.edu/static/public/186/wine+quality.zip"
HASHES = {
    "winequality-red.csv": "4a402cf041b025d4566d954c3b9ba8635a3a8a01e039005d97d6a710278cf05e",
    "winequality-white.csv": "76c3f809815c17c07212622f776311faeb31e87610d52c26d87d6e361b169836",
}


def main():
    target = ROOT / "data/raw"
    target.mkdir(parents=True, exist_ok=True)
    if all((target / name).exists() and sha256((target / name).read_bytes()).hexdigest() == digest
           for name, digest in HASHES.items()):
        print("CSV уже загружены, SHA-256 совпадают.")
        return
    with urlopen(URL, timeout=60) as response:
        archive = ZipFile(BytesIO(response.read()))
    contents = {name: archive.read(name) for name in HASHES}
    for name, data in contents.items():
        if sha256(data).hexdigest() != HASHES[name]:
            raise ValueError(f"SHA-256 не совпадает: {name}")
        path = target / name
        if path.exists() and path.read_bytes() != data:
            raise FileExistsError(f"Сохраните свою копию отдельно: {path}")
    for name, data in contents.items():
        (target / name).write_bytes(data)
        print(f"Сохранён {name}")


if __name__ == "__main__":
    main()
