# ProviderObject

Объект **ProviderObject** содержит данные о настройках и условиях провайдера. Объект отвечает за формирование списка доступных провайдеров.    
В объекте представлены следующие поля:
* id - идентификатор правила настроек;
* name - наименование правила;
* description - описание правила;
* proxy - ссылка на идентификатор прокси- сервера из объекта `ProxyObject`;
* identity - уровень идентификации провайдера <!-- ссылка -->;
* accounts - номер счета провайдера в системе;
* terms - условия, применимые к провайдеру;
* params_schema - параметры передачи данных для адаптера;
* abs_account - номер счета абс <!-- не исп. -->;
* payment_terms - условия для платежа;
* recurrent_paytool_terms - условия для рекуррентных платежей;
* terminal - условия по выбору терминала. 

Данные полей можно визуализировать в виде таблицы, используемой в *Control center*, ппредставленной ниже.

| id | name   | description | proxy | identity | accounts | terms | params_schema | abs_account | payment_terms | recurrent_paytool_terms | terminal|
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
|1001|Test CHANGE|Test desc|object...|object...|object...|object...|object...|123|object...|object...|object...|
|...|...|...|...|...|...|...|...|...|...|...|...|

При нажатии на строку, раскрывается форма редактирования полей, отображаемых в таблице. 

## Перечень объектов, на которые ссылается `ProviderObject`
- ProxyObject
- TerminalObject
- CurrencyObject
- CategoryObject
- PaymentMethodObject