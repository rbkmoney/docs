---
title: Yandex Pay

search: true

metatitle: pay

metadescription: Руководство разработчика

language_tabs:
  - shell

category: Developer guide

---

# Yandex Pay 

Настоящий документ представляет собой руководство по использованию платежного метода [Yandex Pay](https://pay.yandex.ru). Руководство определяет порядок действий для:

* размещения кнопки **Yandex Pay** на странице оплаты веб-сайта;
* осуществления информационного взаимодействия c целью совершения платежа.

Принцип работы способа оплаты **Yandex Pay** указан на сайте [pay.yandex.ru](https://pay.yandex.ru).

Инструкция предназначена для компаний, осуществляющих прием платежей с помощью собственной платежной формы и взаимодействия с платформой RBK.money по [API](https://developer.rbk.money/api/).

Если прием платежей осуществляется с помощью [платежного виджета](https://rbk.money/payment-solutions/) RBK.money, описанные ниже действия выполнять не требуется — способ оплаты **Yandex Pay** уже доступен для покупателей.

## Размещение кнопки и обработчика событий Yandex Pay {#button}

Для добавления кнопки и обработчика событий **Yandex Pay** на страницу оплаты веб-сайта необходимо ознакомиться с официальной документацией [Yandex](https://yandex.ru/dev/yandex-pay/doc/index.html) и выполнить на уровне frontend действия, описанные в [данной статье](https://yandex.ru/dev/yandex-pay/doc/tutorial/index.html).

!!! note "Информация"
    Для того, чтобы получить `merchant_id` необходимо пройти [регистрацию](https://yandex.ru/dev/yandex-pay/doc/integration-tutorial/index.html) в сервисе Yandex Pay.

## Оплата с помощью Yandex Pay {#pay}

Для совершения оплаты с помощью метода **Yandex Pay** необходимо придерживаться стандартного [процесса проведения платежа](../overview.md#payScheme). При этом:

* при выборе данного метода покупатель должен нажать соответствующую [кнопку](#button) на странице оплаты заказа: шаг 5 [схемы](../overview.md#payScheme) проведения платежа;
* запрос на токенизацию данных в Yandex Pay описан в разделе [«Токенизация платежных данных в Yandex Pay»](#token): шаг 6 [схемы](../overview.md#payScheme) проведения платежа.
* при формировании [запроса на создание токена платежного средства](https://developer.rbk.money/api/#operation/createPaymentResource) (шаг 7 [схемы](../overview.md#payScheme) проведения платежа) в объекте `PaymentTool` следует указать нижеприведенные значения.

| Параметр | Значение |
|---------|----------|
|`provider`|YandexPay|
|`paymentToolType`|TokenizedCardData|
|`gatewayMerchantID`| Идентификатор мерчанта (продавца), выданный [группой сопровождения RBK.money](mailto:support@rbk.money) |
|`paymentToken`| Структура и значения, [полученные от Yandex Pay](#token)|

### Токенизация платежных данных в Yandex Pay {#token}

Токенизация данных в Yandex Pay выполняется на шаге 6 [схемы взаимодействия](../overview.md#payScheme) с RBK.money (он же - шаг 4 процесса оплаты в статье [Yandex Pay Web SDK](//yandex.ru/dev/yandex-pay/doc/index.html)). Получение токена осуществляется путем передачи `paymentData` сервису Yandex Pay: см. в [инструкции](https://yandex.ru/dev/yandex-pay/doc/tutorial/index.html) шаги «Создайте новый экземпляр платежа» и «Создайте кнопку Yandex Pay».

В случае подтверждения покупателем оплаты заказа сервис Yandex Pay создает для него платежный токен (PaymentToken). Yandex Pay отправляет созданный токен на frontend сайта продавца: см. ниже **Callback**. Полученный токен должен быть передан RBK.money при формировании платежного [запроса](https://developer.rbk.money/api/#operation/createPaymentResource): см. шаг 7 [данной](../overview.md#payScheme) схемы взаимодействия.

**Сallback**

```json
{
  "type": "process",
  "token": "eyJ******X19",
  "paymentMethodInfo": {
    "cardLast4": "0606",
    "cardNetwork": "MASTERCARD",
    "type": "CARD"
  }
}
```

| Параметр | Описание | Значения/Примеры |
|---------|----------|----------|
|`type`|Тип события|См. [PaymentEventType](https://yandex.ru/dev/yandex-pay/doc/method-reference/yapay/index.html#enums)|
|`token`|Значение токена платежных данных|eyJ******X19|
|`paymentMethodInfo`| Объект с информацией о банковской карте покупателя| |----------|
|`cardLast4`| Четыре последние цифры номера карты|0606|
|`cardNetwork`| Платежная система |См. [AllowedCardNetwork](https://yandex.ru/dev/yandex-pay/doc/method-reference/yapay/index.html#enums)|
|`type`| Метод оплаты | См. [PaymentMethodType](https://yandex.ru/dev/yandex-pay/doc/method-reference/yapay/index.html#enums)|

!!! note "Информация"
    ∙ Тип события `Error` имеет причину с определенным кодом ошибки. C кодами ошибок можно ознакомиться на странице [с описанием интерфейса YaPay](https://yandex.ru/dev/yandex-pay/doc/method-reference/interfejjs-yapay/index.html): см. `ErrorEventReason`.</br>
    ∙ Список разрешенных в Yandex Pay платежных систем может отличаться от списка разрешенных в RBK.money.
