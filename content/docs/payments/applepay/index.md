---
title: Apple Pay

search: true

metatitle: pay

metadescription: Руководство разработчика

language_tabs:
  - shell

category: Developer guide

---


# Apple Pay

Настоящий документ представляет собой руководство по использованию платежного метода [Apple Pay](https://www.apple.com/ru/apple-pay/). Руководство определяет порядок действий для:

* размещения кнопки **Apple Pay** на странице оплаты веб-сайта;
* осуществления информационного взаимодействия c целью совершения платежа.

Принцип работы способа оплаты **Apple Pay** указан на сайте [developer.apple.com](https://developer.apple.com/apple-pay/).

Инструкция предназначена для компаний, осуществляющих прием платежей с помощью собственной платежной формы и взаимодействия с платформой RBK.money по [API](https://developer.rbk.money/api/).

Если прием платежей осуществляется с помощью [платежного виджета](https://rbk.money/payment-solutions/) RBK.money, описанные ниже действия выполнять не требуется — способ оплаты **Yandex Pay** уже доступен для покупателей.

## Размещение кнопки и обработчика событий **Apple Pay** {#button}

Для добавления кнопки и обработчика событий **Apple Pay** на страницу оплаты веб-сайта необходимо выполнить действия, описанные в [данной документации](https://developer.apple.com/documentation/apple_pay_on_the_web): проверить доступность оплаты с помощью данного метода, настроить свой сервер для взаимодействия с Apple, встроить кнопку оплаты с помощью JavaScript, создать платежную сессию.

**Проверка доступности метода оплаты**

См. [данную](https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/checking_for_apple_pay_availability) инструкцию.

!!! note "Идентификатор мерчанта и сертификат"
    Для того чтобы получить `merchantIdentifier`, можно обратиться в [службу поддержки RBK.Money](mailto:int@rbk.money). При обращении следует сообщить домен веб-сайта, на котором будет размещена кнопка, с целью его успешной верификации в **Apple Pay**.
    Альтернативным вариантом получения `merchantIdentifier` является самостоятельная [регистрация](https://developer.apple.com/documentation/apple_pay_on_the_web/configuring_your_environment) merchant ID в **Apple Pay**. Полученный в процессе [Payment Processing Certificate](https://help.apple.com/developer-account/#/devb2e62b839?sub=devf31990e3f) необходимо передать в [службу поддержки RBK.Money](mailto:int@rbk.money).
    
!!! note "Информация"
    Обратите внимание, что `ApplePaySession` запустится только на домене с валидным SSL-сертификатом.

**Отображение кнопки Apple Pay**

Необходимо разместить CSS согласно [гайдлайнам Apple](https://developer.apple.com/documentation/apple_pay_on_the_web/displaying_apple_pay_buttons_using_css), [отобразить](https://developer.apple.com/documentation/apple_pay_on_the_web/displaying_apple_pay_buttons_using_css) кнопку оплаты и указать для неё обработчик, который запустит платежную сессию.

**Создание платежной сессии**

См. [данную](https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/creating_an_apple_pay_session) инструкцию.

!!! note "Информация"
    Сумма платежа должна совпадать с суммой созданного раннее [инвойса](https://developer.rbk.money/docs/payments/overview/#invoice).

**Валидация мерчанта**

См. [данную](https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/providing_merchant_validation) инструкцию.

C целью проверки возможности оплаты с использованием вашего идентификатора мерчанта и получения необходимых данных для запуска платежа необходимо сформировать структуру данных и асинхронно передать ее на backend RBK.money.

!!!note "Информация"
    В качестве `validationURL` необходимо использовать endpoint RBK.money: https://wrapper.rbk.money/applepay/api/v1/session.

Полный набор действий при работе с сессией оплаты отражен в [данной](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession) статье.

**Пример итогового JS-кода**

```js
var domainName = 'developer.rbk.money';
var merchantIdentifier = 'merchant.money.rbk.checkout';
var paymentAmount = 10;
var merchantValidationEndpoint = 'https://wrapper.rbk.money/applepay/api/v1/session';
var displayName = 'RBKmoney Apple Pay Test';

if (window.ApplePaySession) {
    var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    promise.then(function(canMakePayments) {
        if (canMakePayments)
            processApplePayRoutine();
        else
            document.getElementById("apple-pay-button").style.display = 'none';
    });
} else {
    document.getElementById("apple-pay-button").style.display = 'none';
}

function processApplePayRoutine() {
    document.getElementById("apple-pay-button").onclick = function(event) {
        var paymentRequest = {
            currencyCode: 'RUB',
            countryCode: 'RU',
            total: {
                label: displayName,
                amount: paymentAmount
            },
            merchantCapabilities: ['supports3DS'],
            supportedNetworks: ['masterCard', 'visa']
        };

        var session = new ApplePaySession(3, paymentRequest);

        session.onvalidatemerchant = function(event) {
            var promise = validateMerchant(event.validationURL);
            promise.then(function(merchantSession) {
                session.completeMerchantValidation(merchantSession);
            });
        }

        function validateMerchant(validationURL) {
            return new Promise(function(resolve, reject) {
                var applePayPayload = {
                    'merchantId': merchantIdentifier,
                    'validationURL': validationURL,
                    'body': {
                        'merchantIdentifier': merchantIdentifier,
                        'domainName': domainName,
                        'displayName': displayName
                    }
                };

                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    var data = JSON.parse(this.responseText);
                    resolve(data);
                };
                xhr.onerror = reject;
                xhr.open('POST', merchantValidationEndpoint, true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                xhr.send(JSON.stringify(applePayPayload));
            });
        }

        session.onpaymentauthorized = function(event) {
            console.log(JSON.stringify(event.payment.token));
            session.completePayment(ApplePaySession.STATUS_SUCCESS);
        }

        session.begin();
    }
};
```

## Оплата с помощью Apple Pay {#pay}

Для совершения оплаты с помощью метода **Apple Pay** необходимо придерживаться стандартного [процесса проведения платежа](../overview.md#payScheme). При этом:

* при выборе данного метода покупатель должен нажать соответствующую [кнопку](#button) на странице оплаты заказа: шаг 5 [схемы](../overview.md#payScheme) проведения платежа;
* при формировании [запроса на создание токена платежного средства](https://developer.rbk.money/api/#operation/createPaymentResource) (шаг 7 [схемы](../overview.md#payScheme) проведения платежа) в объекте `PaymentTool` следует указать [нижеприведенные значения](#paymentResource).

| Параметр | Значение |
|---------|----------|
|`provider`|ApplePay|
|`paymentToolType`|TokenizedCardData|
|`gatewayMerchantID`| Идентификатор мерчанта (продавца), выданный [группой сопровождения RBK.money](mailto:int@rbk.money)/выданный Apple Pay|
|`paymentToken`| [Полученные](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession/1778020-onpaymentauthorized) структура и значения [ApplePayPaymentToken](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentauthorizedevent/1777999-payment) |

!!!note "Информация"
    При проведении платежа помимо настоящей банковской карты может быть использована тестовая карта MasterCard со следующими данными:
    PAN 5204 2477 5000 1471, Expiration Date 11/2022, CVC 111. Инструкция по созданию тестового аккаунта Apple и привязке тестовой карты находится по данному адресу [https://developer.apple.com/apple-pay/sandbox-testing](https://developer.apple.com/apple-pay/sandbox-testing/).