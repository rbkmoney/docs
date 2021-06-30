# TermSetHierarchyObject

Объект **TermSetHierarchyObject** содержит данные о родительских условиях (`parent_terms`) и собственных условиях (`terms`).
В объекте представлены следующие поля:
* id - номер условия;
* name - наименование условия;
* description - описание условия;
* parent_terms - идентификатор родительских условий;
* term_sets - условия, дополняющие или изменяющие родительские.

Данные полей можно визуализировать в виде таблицы, используемой в *Control center*, представленной ниже.

| id | name   | description | parent_terms | term_sets |
| :--- | :--- | :---        | :---         | :---      |
|1719 | Baseline 3.95% | object... | object... | object... |
| ... | ...   | ...         | ...          | ...       |

При нажатии на строку, раскрывается форма редактирования полей, отображаемых в таблице. 

## Перечень объектов, на которые ссылается `TermSetHierarchyObject`
- PaymentMethodObject
- CategoryObject
- CurrencyObject