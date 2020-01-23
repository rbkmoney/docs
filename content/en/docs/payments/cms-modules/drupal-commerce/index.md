# Платежный плагин RBKmoney для Drupal с модулем Commerce

Модуль оплаты `commerce_rbkmoney` необходим для интеграции с сервисом [RBKmoney](http://rbk.money/) на базе CMS Drupal и компонента [Drupal commerce](https://www.drupal.org/project/commerce).

- Модуль доступен для скачивания в нашем [открытом репозитории на GitHub](https://github.com/rbkmoney/rbkmoney-cms-drupal-commerce/releases/latest);
- Текущая стабильная версия модуля - v1.0.

###Требования к CMS Drupal:
* версия 7;
* компонент `Commerce`. Модуль тестировался на `Commerce 7.x-1.14`.

### Установка и настройка

Модуль находится в папке `commerce_rbkmoney`

1. Установка. Копируем папку с модулем в каталог `/sites/all/modules`
1. Включаем модуль на странице `/admin/build/modules`, раздел **Commerce (payment)**
1. Настройка осуществляется по адресу `/admin/store/settings/rbkmoney`
	1. Прописываем ShopId магазина (берем из личного кабинета)
	2. Копируем приватный ключ (берем из личного кабинета)
	3. Копируем публичный ключ для обработки уведомлений (берем из личного кабинета)
1. Указать в личном кабинете callback URL для обработки уведомлений о смене статуса инвойса: https://<your-site>/commerce/rbkmoney/callback/result
