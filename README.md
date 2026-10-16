# Wine statistics — Lab01

Совместное исследование Wine Quality. Это стартовая структура, а не выполненная лабораторная: результаты, источники и выводы заполняются после исследования.

## Навигация
- [План и роли](docs/PLAN.md)
- [Правила совместной работы](CONTRIBUTING.md)
- [Методические ограничения](docs/METHODOLOGY.md)
- [Источники](references/README.md)
- [Данные и происхождение](data/README.md)
- [Итоговый ноутбук](notebooks/Lab01.ipynb)
- Sprint 1: [quality](notebooks/sprint1/01_quality.ipynb), [alcohol](notebooks/sprint1/02_alcohol.ipynb), [volatile_acidity](notebooks/sprint1/03_volatile_acidity.ipynb)
- Sprint 2: [генератор](notebooks/sprint2/01_generator.ipynb)
- [Дополнительная математика](notebooks/extensions/01_geometry_models.ipynb)

## Запуск
Python 3.11+; команды из корня репозитория:
```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
jupyter lab
```
В Windows активация: `.venv\Scripts\activate`.
Сначала прочитайте `data/README.md` и положите исходные CSV в `data/raw/`.
Ноутбуки пока содержат исполняемую загрузку и задания, но не готовую аналитику.

## Организация
`src/wine_stats/` — общий код; `tests/` — проверки; `reports/figures/` — рисунки;
`reports/tables/` — итоговые метрики; `references/` — журнал литературы.
Каждый участник редактирует свой ноутбук; итоговый собирает один интегратор.
Сроки задаются относительно начала: два спринта по две недели, календарная дата не установлена.
