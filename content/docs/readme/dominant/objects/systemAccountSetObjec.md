# SystemAccountSetObject

Объект **SystemAccountSetObject** содержит данные о типах счетов в системе.  
В объекте представлены следующие поля:
* id - идентификатор счета;
* name - наименование счета;
* description - описание счета;
* accounts - номер счета.
 
Данные полей можно визуализировать в виде таблицы, используемой в *Control center*, представленной ниже.

| id | name | description | accounts |
|:---|:---|:---|:---|
|1 | Тестовые счёта системы | Счёта для учёта тестовых платежей в системе | object...|
|...|...|...|...|

При нажатии на строку, раскрывается форма редактирования полей, отображаемых в таблице.