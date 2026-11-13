# Wine statistics Lab01

Анализ quality, alcohol и volatile_acidity в UCI Wine Quality. Два спринта собраны в [итоговом ноутбуке](notebooks/Lab01.ipynb).

## Запуск

Python 3.11+. Команды из корня репозитория:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
python scripts/download_data.py
jupyter lab notebooks/Lab01.ipynb
```

В Windows: `.venv\Scripts\activate`. В Jupyter выберите Restart Kernel and Run All Cells.
Скрипт загрузки проверяет SHA-256 двух исходных CSV. Для анализа после загрузки интернет не нужен.

## Воспроизведение сборки

```bash
python scripts/build_notebook.py
python scripts/run_notebooks.py
python -m pytest -q
python scripts/export_site_data.py
python scripts/export_html.py
python -m http.server 8000
```

Сайт: http://localhost:8000/WebSite/. Отчёт для чтения: http://localhost:8000/reports/Lab01.html.
В HTML скрыт длинный код, в ноутбуке его можно раскрыть. Формулы в HTML используют MathJax из CDN.
`build_notebook.py` собирает исходные ячейки и сбрасывает результаты итогового ноутбука. После сборки нужен полный запуск.

## Материалы

- [Первый спринт](notebooks/sprint1/): три величины, выборки, гипотезы и дополнительные модели.
- [Второй спринт](notebooks/sprint2/): разбиение, регрессия, kNN, два генератора и проверки.
- [Что объединено и исправлено](docs/INTEGRATION.md).
- [Данные](data/README.md), [источники](references/README.md), [ограничения](docs/METHODOLOGY.md).
- [Исходный план](docs/PLAN.md), [правила работы](CONTRIBUTING.md).

При отдельном запуске второго спринта порядок такой: `00_data_split`, `01_alcohol_quality_models`,
`02_knn`, `03_final_test`, `01_generator`, `04_generator_comparison`, `05_generator_convergence`, `06_rejection_generator`.

Сайт дополняет исследование. Точные вероятности генератора, показатели и p-value обновляются через
`scripts/export_site_data.py`; файл `WebSite/research-data.js` вручную не редактируют.
