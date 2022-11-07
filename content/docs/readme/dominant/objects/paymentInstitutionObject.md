# PaymentInstitutionObject

Объекте **PaymentInstitutionObject** содержит данные о платежных институтах. Объект служит для настройки роутинга выплат и выбора провайдера по условиям. Можно создать комбинацию из нескольких условий (И, ИЛИ, НЕ, последовательность условий) по следующим критериям:  
1. параметры карты, на которую идет выплата:
   - страна банка-эмитента карты;
   - название банка-эмитента;
   - платежная система;
2. сумма текущей выплаты;
3. названию мерчанта.

В объекте представлены следующе поля:
* id - идентификатор;
* name - наименование института;
* description - описание института;
* calendar - ссылка на объект `CalendarObject`, в котором содержится производственный календарь;
* system_account_set - номер счета системы;
* default_contract_template - ссылка на объект `ContractTemplateObject` и его дефолтное значение;
* default_wallet_contract_template - ссылка на идентификатор дефолтного контракта для кошелька;
* inspector - указание используемого антифрода (внутренний или внешний);
* realm - тип окружеия (0 - тестовое; 1 - продуктивное);
* residences - код страны института;
* wallet_system_account_set - системный счёт кошелька для выплат;
* identity - уровень идентификации системы;
* p2p_inspector - ссылка на  `InspectorObject`;
* payment_routing - идентификатор используемого роутинга;
* withdrawal_providers - провайдеры для выплат;
* p2p_providers - провайдеры для p2p платежей;
* withdrawal_providers_legacy - список устаревших провайдеров;
* p2p_providers_legacy - список устаревших провайдеров p2p;
* providers - список провайдеров.

Данные полей можно визуализировать в виде таблицы, используемой в *Control center*, представленной ниже.

| id | name | description | calendar | system_account_set | default_contract_template | inspector | realm | residences | wallet_system_account_set | identity | p2p_inspector | payment_routing | withdrawal_providers | p2p_providers | withdrawal_providers_legacy | p2p_providers_legacy | providers|
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
|100|НКО «ЭПС»|Платёжная организация, обслуживающая переводы и выплаты в рублях на расчётные счета юридических лиц, резидентов РФ, в российских банках|object...|object...|object...|object...|object...|1|object...|object...|object...|object...|object...|object...|object...|object...|object...|
|...|...|...|...|...|...|...|...|...|...|...|...|...|...|...|...|...|...|

При нажатии на строку, раскрывается форма редактирования полей, отображаемых в таблице.

## Перечень объектов, на которые ссылается `PaymentInstitutionObject`
- InspectorObject
- ProviderObject
- WithdrawalProviderObject
- P2PProviderObject
