# Dominant
<!-- insert your shields here -->

<!-- TOC -->
## Содержание
- [Общее описание](#Общее-описание)
- [Объекты сервиса, настраиваемые с помощью Command-center](#Объекты-сервиса,-настраиваемые-с-помощью-Command-center)
   - [CurrencyObject](#CurrencyObject)
   - [CategoryObject](#CategoryObject)
   - [PaymentMethodObject](#PaymentMethodObject)
   - [ContractTemplateObject](#ContractTemplateObject)
   - [TermSetHierarchyObject](#TermSetHierarchyObject)
   - [ProxyObject](#ProxyObject)
   - [ProviderObject](#ProviderObject)
   - [WithdrawalProviderObject](#WithdrawalProviderObject)
   - [P2PProvider](#P2PProvider)
   - [PayoutMethodObject](#PayoutMethodObject)
   - [TerminalObject](#TerminalObject)
   - [PaymentInstitutionObject](#PaymentInstitutionObject)
   - [CalendarObject](#CalendarObject)
   - [BusinessScheduleObject](#BusinessScheduleObject)
   - [SystemAccountSetObject](#SystemAccountSetObject)
   - [ExternalAccountSetObject](#ExternalAccountSetObject)
   - [InspectorObject](#InspectorObject)
   - [P2PInspectorObject](#P2PInspectorObject)
   - [GlobalsObject](#GlobalsObject)
- [Связанные сервисы](#Связанные-сервисы)
- [Составители](#Составители)

## Общее описание
**Dominant (Domain Configuration Service)** - сервис, обеспечивающий хранение конфигураций домена платформы. Конфигурация состоит из объектов протокола [damsel](https://github.com/rbkmoney/damsel/blob/master/proto/domain.thrift), объединенных в ревизии. При изменении, как минимум, одного из параметров любого объекта, образуется новая ревизия. Список произошедших изменений хранится в сервисе *Machinegun*.     

Настройки данных объектов могут производиться с помощью:    
1. графического web- интерфейса *Control center*;
2. методов [API](https://github.com/rbkmoney/damsel/blob/master/proto/domain.thrift) сервиса.

## Объекты сервиса 
В сервисе хранятся нижеперечисленные объекты.
### CurrencyObject
[Объект валюты.](objects/currencyObject.md)

### CategoryObject
[Объект категорий магазинов.](objects/categoryObject.md)

### PaymentMethodObject
[Объект предоставляемых способов оплаты.](objects/paymentMethodObject.md)

### ContractTemplateObject
[Объект шаблонов контрактов, содержащих ссылку на условия.](objects/сontractTemplateObject.md)

### TermSetHierarchyObject
[Объект иерархий условий.](objects/termSetHierarchyObject)

### ProxyObject
[Объект, хранящий адреса и параметры сервисов-адаптеров.](objects/proxyObject.md)

### ProviderObject
[Объект настроек и условий провайдера.](objects/providerObject)


### PayoutMethodObject
[Объект типов вывода (выводы на счета нерезидентов, выводы на кошельки мерчантов, вывод счет резидента) платежных средств.](objects/payoutMethodObject.md)

### TerminalObject
[Объект с описанием терминалов.](objects/terminalObject.md)

### PaymentInstitutionObject
[Объект платежных институтов.](objects/paymentInstitutionObject.md)

### CalendarObject
[Объект календарей.](objects/calendarObject.md)

### BusinessScheduleObject
[Объект видов расписаний.](objects/businessScheduleobject.md)

### SystemAccountSetObject
[Объект типов счетов в системе.](objects/systemAccountSetObjec.md)

### ExternalAccountSetObject
[Объект типов счетов для выплат.](objects/externalAccountSetObject.md)

### InspectorObject
[Объект, описывающий провайдера антифрода.](objects/inspectorObject.md)

### P2PInspectorObject
[Объект для настройки антифрода P2P.](objects/p2pInspectorObject.md)

### GlobalsObject
[Аккаунты, используемые в проводках.](objects/globalsObject.md)

## Связанные сервисы
В процессе работы **Dominant** может направлять данные в сервис **Machinegun**. 

## Составители