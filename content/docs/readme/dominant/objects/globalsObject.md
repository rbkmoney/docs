# GlobalsObject

<!-- LEGACY object -->

Объект **GlobalsObject** содержит данные об аккаунтах, используемых в проводках.

Информация представлена в виде интерактивной таблицы, в которой указаны:
* external_account_set - ссылка на ExternalAccountSetObject;
* payment_institutions - ссылка на PaymentInstitutionObject;
* contract_payment_institution_defaults - системные аккаунты.

Данные полей можно визуализировать в виде таблицы, используемой в *Control center*, представленной ниже.

| external_account_set | payment_institutions | contract_payment_institution_defaults |
|:---|:---|:---|
|object...| object...|object...|

При нажатии на строку, раскрывается форма редактирования полей, отображаемых в таблице.