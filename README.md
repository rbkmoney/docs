# RBKmoney public docs

[![wercker status](https://app.wercker.com/status/c2f14b42298e56698eaa7d2d9ad7fa63/s/master "wercker status")](https://app.wercker.com/project/byKey/c2f14b42298e56698eaa7d2d9ad7fa63)

После деплоя документация будет доступна по адресу [https://developer.rbk.money/](https://developer.rbk.money/)

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

Для генерации картинок из диаграмм используются следующие инструменты:

* [sequencediagram.org](https://sequencediagram.org)
    * допополнительная информация для поддержки svg [здесь](https://stackoverflow.com/questions/644896/how-do-i-scale-a-stubborn-svg-embedded-with-the-object-tag/3484847#3484847).
    * пример использования svg: 
        * встроить отображение для html можно с помощью
            ```html
            <object data="../../recurring/img/CustomerPayer.svg"> </object>
            ```
        * управлять размером можно с помощью внесения изменений в .svg (тег `<svg>`)
            ```xml
            preserveAspectRatio="xMinYMin meet"
            viewBox="0 0 1451 3265">
            ```
  
* [platinum-toolset](https://github.com/rbkmoney/platinum-toolset) (язык [PlantUML](http://plantuml.com)).  
    * для работы этому инструменту необходима Java Runtime;
    * Установить его можно при помощи:
        ```shell
        make install-toolset
        ```
    * Чтобы сгенерировать изображения png и svg из файлов с диаграммами wsd, достаточно:
        ```shell
        make
        ```      

### Локальное тестирование/ревью изменений

#### Этап подготовки

**Выполняется разово.**

1. Устанавливаем Python c сайта https://www.python.org.

    ---
    **ПРИМЕЧАНИЕ**

    Необходимы права системного администратора.

    ---

2. Устанавливаем MkDocs, следуя инструкциям с сайта https://www.mkdocs.org/#installation: раздел "Installation".

    ---
    **ПРИМЕЧАНИЕ**

    * Для того, чтобы проверить установлен ли `pip` по-умолчанию вместе с Python достаточно ввести в командной строке команду `pip` или `pip3`: `pip3` не всегда маппится на `pip`, иногда приходится указывать это явно.
    * Во время установки MkDocs с помощью `pip` (`pip install mkdocs` или `pip3 install mkdocs`) может возникнуть сообщение о том, что каталог установлен не в PATH. Добавление в PATH является опциональным шагом: цель — при сборке сайта указывать алиас 'mkdocs' вместо полного пути расположения MkDocs.

    ---

#### Этап тестирования/ревью

**Выполняется каждый раз при проверке изменений.**

1. Скачиваем содержимое ветки, в которой создан Pull Request (PR). Результат: на локальном диске должна оказаться папка docs со всеми внесенными в рамках PR’а изменениями.

    ---
    **ПРИМЕЧАНИЕ**

    Шаг 1 выполняется только для ревью изменений. Сотруднику, который внес изменения, следует начинать тестирование с шага 2.

    ---

2. Переходим в docs (где лежит файл "mkdocs.yml"): команды `ls` (посмотреть список репозиториев) и `cd  repository_name`  (перейти в репозиторий).

3. Собираем тестовый сайт.
    * если на этапе подготовки mkdocs был добавлен в PATH:

    ```shell
    mkdocs serve --livereload
    ```

   * если на этапе подготовки mkdocs не был добавлен в PATH:
  
    ```shell
    {mkdocs_path} serve --livereload
    ```

    Пример:

    ```shell
    /Users/{user_name}/Library/Python/3.9/bin/mkdocs serve --livereload 

    ```

    ---
    **ПРИМЕЧАНИЕ**

    * Сборка запускается из репозитория docs.
    * При самой первой сборке могут возникнуть ошибки. Как правило, они устраняются путем установки необходимого MkDocs:

        ```shell
        pip3 install -r requirements.txt 

        ```

        Требуемые файлы и плагины также можно устанавливать по отдельности. Команды запускаются из репозитория docs.

    * Если cборка сайта прошла успешно, в терминале появится строка с `INFO    -  Documentation built`.
    * Адрес сайта будет указан в строке `INFO    -  Serving on {Site name}`, где {Site name} - адрес сайта.
    ---
