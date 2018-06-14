# RBKmoney public docs

[![wercker status](https://app.wercker.com/status/c2f14b42298e56698eaa7d2d9ad7fa63/s/master "wercker status")](https://app.wercker.com/project/byKey/c2f14b42298e56698eaa7d2d9ad7fa63)

После деплоя документация будет доступна по адресу [https://developer.rbk.money/docs/](https://developer.rbk.money/docs/)

## Сборка

Для генерации статического сайта с документацией мы используем [MkDocs](http://www.mkdocs.org/). Убедитесь, что в используемой вами системе наличествует [make](https://www.gnu.org/software/make/), актуальная версия [Python](https://python.org) и его верный менеджер [pip](https://pypi.python.org/pypi/pip/).

Для начала установите необходимый инструментарий:

```shell
pip install -r requirements.txt
```

После чего вы уже можете запускать локальный сервер для разработки с готовой документацией:

```shell
mkdocs serve --livereload
```

### Диаграммы

Для генерации картинок из диаграмм на языке [PlantUML](http://plantuml.com) мы используем простой в использовании [platinum-toolset](https://github.com/rbkmoney/platinum-toolset). Будьте внимательны, для работы этому инструменту необходима Java Runtime.

Установить его можно при помощи:

```shell
make install-toolset
```

Теперь, чтобы сгенерировать изображения png и svg из файлов с диаграммами wsd, достаточно всего лишь:

```shell
make
```
