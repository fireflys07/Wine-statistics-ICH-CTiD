"""Create a read-only notebook with results and prose, without Python cells.

Keep Lab01.ipynb as the executable source; regenerate this file after Run All.
"""
from copy import deepcopy
from pathlib import Path
import re
import nbformat as nbf

ROOT = Path(__file__).resolve().parents[1]


def build():
    source = nbf.read(ROOT / 'notebooks/Lab01.ipynb', as_version=4)
    cells = [nbf.v4.new_markdown_cell(
        '# Лабораторная работа 01 · Инфохимия\n\n'
        '**Итоговый отчёт для сдачи: первый и второй спринты.**\n\n'
        'Ниже сохранены пояснения, формулы, таблицы и графики. '
        '[Исполняемая версия с кодом](Lab01.ipynb) предназначена для повторного расчёта.\n\n'
        '[Данные и источники](../data/README.md) · [Проверка готовности](../docs/READINESS.md)')]
    image_count = 0
    for cell in source.cells:
        if cell.cell_type == 'markdown':
            copy = deepcopy(cell)
            # These instructions are for the executable copy, not the reader.
            copy.source = copy.source.replace('Код длинных ячеек свёрнут в JupyterLab; его можно раскрыть.', '')
            copy.source = copy.source.replace('Весь код свёрнут в JupyterLab; его можно раскрыть.', '')
            copy.source = copy.source.replace('Для запуска: `python scripts/download_data.py`, затем Restart Kernel and Run All Cells.', '')
            cells.append(copy)
            continue
        if cell.cell_type != 'code':
            continue
        if cell.execution_count is None:
            raise ValueError(f'Unexecuted cell: {cell.id}')
        for output in cell.outputs:
            if output.output_type == 'error':
                raise ValueError(f'Failed cell: {cell.id}')
            if output.output_type == 'stream':
                # Warnings must be reviewed, not silently removed from the report.
                if output.name == 'stderr' and output.text.strip():
                    raise ValueError(f'Review stderr in cell {cell.id}: {output.text[:200]}')
                content = output.text.strip()
                if content:
                    cells.append(nbf.v4.new_markdown_cell('```text\n' + content + '\n```'))
                continue
            data = output.get('data', {})
            if 'image/png' in data:
                image_count += 1
                name = f'figure-{image_count:03d}.png'
                cells.append(nbf.v4.new_markdown_cell(
                    f'![Результат расчёта {image_count}](attachment:{name})',
                    attachments={name: {'image/png': data['image/png']}}))
            elif 'text/html' in data:
                content = data['text/html']
                # DataFrame table values are retained; notebook-only styling is omitted.
                content = re.sub(r'<style.*?</style>', '', content, flags=re.S)
                cells.append(nbf.v4.new_markdown_cell(content))
            elif 'text/markdown' in data:
                cells.append(nbf.v4.new_markdown_cell(data['text/markdown']))
            elif 'text/plain' in data:
                cells.append(nbf.v4.new_markdown_cell('```text\n' + data['text/plain'] + '\n```'))
    for i, cell in enumerate(cells):
        cell.id = f'submission-{i:03d}'
    report = nbf.v4.new_notebook(cells=cells)
    nbf.validate(report)
    target = ROOT / 'notebooks/Lab01_submission.ipynb'
    nbf.write(report, target)
    print(f'{target.name}: {len(cells)} ячеек, {image_count} графиков; Python-код отсутствует')


if __name__ == '__main__':
    build()
