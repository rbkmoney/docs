---
title: Google Pay

search: true

metatitle: pay

metadescription: Руководство разработчика

language_tabs:
  - shell

category: Developer guide

---

# Google Pay 

Настоящий документ представляет собой руководство по использованию платежного метода [Google Pay](https://pay.google.com/intl/ru_ru/about/). Руководство определяет порядок действий для:

* размещения кнопки **Google Pay** на странице оплаты веб-сайта;
* осуществления информационного взаимодействия c целью совершения платежа.

Принцип работы способа оплаты **Google Pay** указан на сайте [developers.google.com](https://developers.google.com/pay/api/web/overview).

Инструкция предназначена для компаний, осуществляющих приём платежей с помощью собственной платёжной формы и взаимодействия с платформой RBK.money по [API](https://developer.rbk.money/api/).

Если приём платежей осуществляется с помощью [платёжного виджета](https://rbk.money/payment-solutions/) RBK.money, описанные ниже действия выполнять не требуется — способ оплаты **Google Pay** уже доступен для покупателей.

## Размещение кнопки и обработчика событий Google Pay {#button}

Для добавления кнопки и обработчика событий **Google Pay** на страницу оплаты веб-сайта необходимо ознакомиться с официальной [документацией Google](https://developers.google.com/pay) и выполнить на уровне frontend действия, описанные в [данном руководстве](https://developers.google.com/pay/api/web/guides/tutorial).

Правила фирменного оформления элементов в стиле Google можно найти [здесь](https://developers.google.com/pay/api/web/guides/brand-guidelines).

!!! note "Информация"
    Для того, чтобы получить `gatewayMerchantId` необходимо обратиться в [службу поддержки RBK.Money](mailto:support@rbk.money).

## Оплата с помощью Google Pay {#pay}

Для совершения оплаты с помощью метода **Google Pay** необходимо придерживаться стандартного [процесса проведения платежа](../overview.md#payScheme). При этом:

* при выборе данного метода покупатель должен нажать соответствующую [кнопку](#button) на странице оплаты заказа: шаг 5 [схемы](../overview.md#payScheme) проведения платежа;
* запрос на токенизацию данных в Google Pay описан в разделе [«Токенизация платежных данных в Google Pay»](#token): шаг 6 [схемы](../overview.md#payScheme) проведения платежа.
* при формировании [запроса на создание токена платёжного средства](https://developer.rbk.money/api/#operation/createPaymentResource) (шаг 7 [схемы](../overview.md#payScheme) проведения платежа) следует передать определенные значения указанных ниже параметров.

| Параметр | Значение |
|---------|----------|
|`provider`|GooglePay|
|`paymentToolType`|TokenizedCardData|
|`gatewayMerchantID`| Идентификатор мерчанта (продавца), выданный [группой сопровождения RBK.money](mailto:support@rbk.money) |
|`paymentToken`| Структура и значения, [полученные от Google Pay](#token)|

### Токенизация платёжных данных в Google Pay {#token}

Токенизация данных в **Google Pay** выполняется на шаге 6 [схемы взаимодействия](../overview.md#payScheme) с RBK.money. Получение токена осуществляется путем передачи `PaymentDataRequest` сервису Google Pay: см. шаги [«Создайте объект PaymentDataRequest»](https://developers.google.com/pay/api/web/guides/tutorial#paymentdatarequest) и [«Настройте обработчик жестов пользователей»](https://developers.google.com/pay/api/web/guides/tutorial#event-handler).

В случае подтверждения покупателем оплаты заказа сервис **Google Pay** создает для него платёжный токен (PaymentToken). Google Pay отправляет созданный токен на frontend сайта продавца: см. ниже **Callback**. Полученный токен должен быть передан RBK.money при формировании платёжного [запроса](https://developer.rbk.money/api/#operation/createPaymentResource): см. шаг 7 [данной](../overview.md#payScheme) схемы взаимодействия.

**Сallback**

```json
{
  "cardInfo": {
    "cardNetwork": "MASTERCARD",
    "cardDetails": "4444",
    "cardImageUri": "https://lh6.ggpht.com/h6TBIVV7tlYGr1zkIA8CmCzINizzASbPIetpxh_5otBu3VkPEC5_Kk_wH5szy7gDhMkRhVVp",
    "cardDescription": "Mastercard •••• 4444",
    "cardClass": "CREDIT"
  },
  "paymentMethodToken": {
    "tokenizationType": "PAYMENT_GATEWAY",
    "token": "{\"signature\":\"MEUCIZ29vZ2xlIHBheSBkZWNvZGVkIHNpZ25hdHVyZSBkYXRhIChiaW5hcnkpCg\\u003d\",\"protocolVersion\":\"ECv1\",\"signedMessage\":\"{\\\"encryptedMessage\\\":\\\"TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwg//c2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWdu//YSBhbGlxdWEuIFV0IGVuaW0gYWQgbWluaW0gdmVuaWFtLCBxdWlzIG5vc3RydWQgZXhlcmNpdGF0//aW9uIHVsbGFtY28gbGFib3JpcyBuaXNpIHV0IGFsaXF1aXAgZXggZWEgY29tbW9kbyBjb25zZXF1YXQuCg\\\",\\\"ephemeralPublicKey\\\":\\\"Z29vZ2xlIHBheSBlbXBoZXJhbCBwdWJsaWMga2V5IChkZWNvZGVkIGJpbmFyeSkK\\\\u003d\\\",\\\"tag\\\":\\\"Z29vZ2xlIHBheSB0YWcgKGRlY29kZWQgYmluYXJ5KQo\\\\u003d\\\"}\"}"
  }
}
```

Описание параметров ответа отражено в [данной статье](https://developers.google.com/pay/api/android/reference/response-objects?hl=ru#PaymentMethodTokenizationData).
