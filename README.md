RBKmoney public docs

- для генерации документации используем http://www.mkdocs.org/
- установка

```shell
pip install mkdocs mkdocs-material Pygments
```

- запуск сервера локально:

```shell
mkdocs serve --livereload
```

- для генерации картинок из диаграм на PlantUML используем platinum-toolset

- установка

```shell
make install-toolset
```

- генерация png и svg из wsd (для этого тулсета понадобится JDK)

```shell
make clean && make all
```
