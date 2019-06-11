# Интеграция Apple Pay в RBKmoney API

Apple Pay — это метод токенизации карточных данных плательщика, который позволяет ускорить и упростить оплату ваших товаров и услуг. В случае, если у плательщика добавлена карта в приложении Apple Pay, он может оплачивать покупки, вводя не свои карточные данные, а используя кнопку "Покупка с Apple Pay". 

Для проведения платежа достаточно передать полученные из Apple Pay токенизированные карточные данные в RBKmoney API, создать инвойс в Платформе и оплатить его с помощью токена RBKmoney, который содержит в себе токен Apple Pay. Таким образом, при оплате производится процесс двойной токенизации - Платформа RBKmoney реализует в схожую бизнес-логику при проведении платежей, создавая на основе платежных данных токены, которые используются для запуска платежей.

!!! note
    Данная инструкция предназначена для тех, кто подключается как платежный процессинг, либо предпочитает верстать свою собственную платежную форму. Если вы используете [RBKmoney Checkout](/docs/payments/checkout/), то кнопка Apple Pay уже включена для ваших плательщиков, никаких дополнительных действий не требуется.

## "Buy with Apple Pay" в web-приложении

Для получения структуры данных Apple Pay, содержащих токен карточных данных, а также другие необходимые для запуска платежа данные, придется реализовать несколько бизнес-процессов, реализуемых в API Safari. Они заключаются в проверке возможности оплаты, запуске сессии, и т.н. валидации мерчанта, когда для запуска платежа нужно будет обратиться по специальному адресу бекэнда RBKmoney.

Рассмотрим пример успешного платеже с тестовой карты Apple Pay с примерами кода на JavaScript.

!!!note
    Здесь и в дальнейшем будет использоваться тестовая карта MasterCard Apple Pay со следующими данными.
    PAN: **5204 2477 5000 1471**, Expiration Date: **11/2022**, CVC: **111**. Инструкция по созданию тестового аккаунта Apple и по привязке тестовой карты можно прочитать в официальной документации [https://developer.apple.com/apple-pay/sandbox-testing/](https://developer.apple.com/apple-pay/sandbox-testing/). Также, Apple Pay не запрещает вам использовать вашу привязанную реальную карту, для нее также будет выведено окно оплаты. Однако, тестовая среда RBKmoney отклонит платеж с любой карты, кроме вышеуказанной тестовой и средства списаны не будут.


### Проверка возможности оплаты с помощью Apple Pay

Убедимся, что устройство или браузер поддерживает оплату с Apple Pay в принципе, а также то, что в Wallet на устройстве добавлена карта, которой можно оплачивать покупки. Для проверки потребуется узнать идентификатор мерчанта.

```js
if (window.ApplePaySession) {
    var promise = ApplePaySession.canMakePaymentsWithActiveCard({YOUR_MERCHANT_ID});
    promise.then(function(canMakePayments) {
        if (canMakePayments)
            //карта привязана, можем запускать сессию
    });
} else {
    //обрабатываем невозможность оплатить
}
```

!!!note
    Используйте следующий идентификатор мерчанта тестовой среды RBKmoney: **merchant.money.rbk.checkout**. Для проведения боевых платежей вам необходимо будет получить идентификатор мерчанта, [обратившись к нам](mailto:support@rbk.money).
    Также, обратите внимание, что ApplePaySession запустится **только** на домене с валидным SSL-сертификатом!

### Формируем структуру платежа для сессии

Задаем наименование товара или услуги, указываем сумму, опционально - валюту платежа. Создаем новую сессию оплаты. Обратите внимание! Сумма платежа должна совпадать со стоимостью созданного в RBKmoney инвойса!

```js
document.getElementById("apple-pay-button").onclick = function(event) {
    var paymentRequest = {
        currencyCode: 'RUB',
        countryCode: 'RU',
        total: {
            label: {PRODUCT_NAME},
            amount: {PAYMENT_AMOUNT}
        },
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['masterCard', 'visa']
    };

var session = new ApplePaySession(3, paymentRequest);    
```

### Проводим валидацию мерчанта

Для проверки возможности оплаты для вашего идентификатора мерчанта и получения необходимых данных для запуска платежа необходимо сформировать структуру данных, асинхронно передать ее на бекэнд RBKmoney и обработать полученный коллбек.


```js
session.onvalidatemerchant = function(event) {
    var promise = validateMerchant(event.validationURL);
    promise.then(function(merchantSession) {
        session.completeMerchantValidation(merchantSession);
    });
}

function validateMerchant(validationURL) {
    return new Promise(function(resolve, reject) {
        var applePayPayload = {
            'merchantId': {YOUR_MERCHANT_ID},
            'validationURL': {RBKMONEY_VALIDATION_URL},
            'body': {
                'merchantIdentifier': {YOUR_MERCHANT_ID},
                'domainName': {YOUR_DOMAIN_NAME},
                'displayName': {PRODUCT_NAME}
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
```

!!!note
    На момент написания статьи активный validationURL RBKmoney - **https://wrapper.rbk.money/applepay/api/v1/session**, используйте его для валидации вашего мерчанта.


### Запускаем сессию и обрабатываем оплату

```js
session.onpaymentauthorized = function(event) {
    //после получения токена передаем его себе на бекэнд
 
    session.completePayment(ApplePaySession.STATUS_SUCCESS);
}

session.begin();
```

### Отображаем кнопку "Buy with Apple Pay"

Согласно гайдлайнам Apple размечаем CSS, отображаем кнопку оплаты и вешаем на нее обработчик, который запустит сессию и проведет платеж.

```html
<div class="apple-pay-button-with-text apple-pay-button-black-with-text" id="apple-pay-button" style="">
  <span class="text">Buy with</span>
  <span class="logo"></span>
</div>
```

### Пример кнопки оплаты

Если все было сделано корректно, ваш браузер или устройство поддерживают Apple Pay с привязанной картой, то отобразится кнопка оплаты:

<div class="apple-pay-button-with-text apple-pay-button-black-with-text" id="apple-pay-button" style="">
  <span class="text">Buy with</span>
  <span class="logo"></span>
</div>
<script src="applepay.js"></script>
<link rel="stylesheet" href="applepay.css">

![photo_2018-06-14_20-32-59.jpg](/docs/payments/img/photo_2018-06-14_20-32-59.jpg)


### Собираем все вместе

Пример JS-кода.

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

!!!note
    Встроенный в эту документацию скрипт логгирует данные Apple Pay в консоль вашего браузера. Вы можете просмотреть их и использовать для тестовых нужд.

## Интеграция Apple Pay в RBKmoney API

Для проведения платежа с Apple Pay необходимо выполнить следующие вызовы RBKmoney API:

- создать в Платформе инвойс, вызвав метод [createInvoice()](https://developer.rbk.money/api/#operation/createInvoice);
- либо, если инвойс уже был создан ранее, создать [invoiceAccessToken](https://developer.rbk.money/api/#operation/createInvoiceAccessToken);
- используя полученный `invoiceAccessToken` создать платежный токен RBKmoney, вызывав метод [createPaymentResource()](https://developer.rbk.money/api/#operation/createPaymentResource);
- использовать полученный платежный токен RBKmoney для запуска одно- или двустадийных платежей.

### Пример структуры [paymentResourse](https://developer.rbk.money/api/#operation/createPaymentResource)

#### Необходимые данные

- в переменной `paymentToolType` укажите значение `TokenizedCardData`;
- в переменной `provider` укажите `ApplePay`;
- в переменной `merchantID` укажите `merchant.money.rbk.checkout`;
- в структуру `paymentToken` передайте структуру, полученную из Apple Pay.

#### Пример корректно заполненной структуры

```json
{
  "paymentTool": {
    "paymentToolType": "TokenizedCardData",
    "provider": "ApplePay",
    "merchantID": "merchant.money.rbk.checkout",
    "paymentToken": {
      "token": {
        "paymentData": {
          "version": "EC_v1",
          "data": "SFifeDwQPOu8Rh47AF3qplwaXmxMYU0Ewu5aw51eJ4AbCa/7MwrbbaVog9WTHvpabl7xnDuHdD+wCyzElCKIxXs1acLs2aC0rP6XSixA7I49aN7s4eMGyc7ZP3hx2dPXFto4bh5I1Pd9+hRJITp//swx+wuAjM3TF0DupLNmkA77zIAlb24JzZ3ItOcRpHQDoYnWyO1IQKvUw9EW1yB54ialI/hUxyqhRniBIAeiPERHrakSzuUjmPdpOCsgQjGHFiN80le9i6cIkvl7HD5bOvaIdb6aAdUAU/uHTLElGT3dymrjQty1OZfmYHB12H0mrTPYJLSWf390247sDsOP4c/f9VmLxcD3wnMAId8J0zSSTWv0l10cW+JgfaP3mnto0Acb/UGXPBYwkP3daQ==",
          "signature": "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",
          "header": {
            "ephemeralPublicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEvCNyjDTYkSr9gboDq+76VvftIbAqUi4PbvJJP/e0XXRWv77MoNEmLh5pJag5ZSEpm7gTSKuTVJ8CgkFjbFpy8w==",
            "publicKeyHash": "ZVhwTYqTzCNgV16oq5xL0rSBMGRojETt21+DdgRXzyk=",
            "transactionId": "09e95dae77a116fa1a8fe2b049b8326ce5f9ff6f66ee8fd01289d05d19aa682e"
          }
        },
        "paymentMethod": {
          "displayName": "MasterCard 1471",
          "network": "MasterCard",
          "type": "debit"
        },
        "transactionIdentifier": "09E95DAE77A116FA1A8FE2B049B8326CE5F9FF6F66EE8FD01289D05D19AA682E"
      }
    }
  },
  "clientInfo": {
    "fingerprint": "d042b8eeada885f5bac8821d99101a09"
  }
}
```

### Собираем все вместе

Ниже приведена цепочка `curl` вызовов к API RBKmoney, позволяющая провести платеж с использованием платежного метода Apple Pay.

- создаем в Платформе инвойс:

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1528470572' \
  -d '{
  "shopID": "TEST",
  "dueDate": "2018-06-08T14:56:31.416Z",
  "amount": 6000,
  "currency": "RUB",
  "product": "Order num 12345",
  "description": "Delicious meals",
    "cart": [
        {
            "price": 5000,
            "product": "Sandwich",
            "quantity": 1,
            "taxMode": {
                "rate": "10%",
                "type": "InvoiceLineTaxVAT"
            }
        },
        {
            "price": 1000,
            "product": "Cola",
            "quantity": 1,
            "taxMode": {
                "rate": "18%",
                "type": "InvoiceLineTaxVAT"
            }
        }
    ],  
"metadata": 
  { 
    "order_id": "Internal order num 13123298761"
  }
}'
```

- пример ответа Платформы:

```json
{
    "invoice": {
        "amount": 6000,
        "cart": [
            {
                "cost": 5000,
                "price": 5000,
                "product": "Sandwich",
                "quantity": 1,
                "taxMode": {
                    "rate": "10%",
                    "type": "InvoiceLineTaxVAT"
                }
            },
            {
                "cost": 1000,
                "price": 1000,
                "product": "Cola",
                "quantity": 1,
                "taxMode": {
                    "rate": "18%",
                    "type": "InvoiceLineTaxVAT"
                }
            }
        ],
        "createdAt": "2018-06-08T13:56:31.188182Z",
        "currency": "RUB",
        "description": "Delicious meals",
        "dueDate": "2018-06-08T14:56:31.416000Z",
        "id": "10vLw0XY144",
        "metadata": {
            "order_id": "Internal order num 13123298761"
        },
        "product": "Order num 12345",
        "shopID": "TEST",
        "status": "unpaid"
    },
    "invoiceAccessToken": {
        "payload": "{INVOICE_ACCESS_TOKEN}"
    }
}
```

- обрабатываем в UA плательщика бизнес-процесс Apple Pay, передаем полученные данные себе на бекэнд и вызываем createPaymentResource():

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/payment-resources \
  -H 'Authorization: Bearer {INVOICE_ACCESS_TOKEN}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1528913559' \
  -d '{
  "paymentTool": {
    "paymentToolType": "TokenizedCardData",
    "provider": "ApplePay",
    "merchantID": "merchant.money.rbk.checkout",
    "paymentToken": {
      "token": {
        "paymentData": {
          "version": "EC_v1",
          "data": "SFifeDwQPOu8Rh47AF3qplwaXmxMYU0Ewu5aw51eJ4AbCa/7MwrbbaVog9WTHvpabl7xnDuHdD+wCyzElCKIxXs1acLs2aC0rP6XSixA7I49aN7s4eMGyc7ZP3hx2dPXFto4bh5I1Pd9+hRJITp//swx+wuAjM3TF0DupLNmkA77zIAlb24JzZ3ItOcRpHQDoYnWyO1IQKvUw9EW1yB54ialI/hUxyqhRniBIAeiPERHrakSzuUjmPdpOCsgQjGHFiN80le9i6cIkvl7HD5bOvaIdb6aAdUAU/uHTLElGT3dymrjQty1OZfmYHB12H0mrTPYJLSWf390247sDsOP4c/f9VmLxcD3wnMAId8J0zSSTWv0l10cW+JgfaP3mnto0Acb/UGXPBYwkP3daQ==",
          "signature": "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",
          "header": {
            "ephemeralPublicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEvCNyjDTYkSr9gboDq+76VvftIbAqUi4PbvJJP/e0XXRWv77MoNEmLh5pJag5ZSEpm7gTSKuTVJ8CgkFjbFpy8w==",
            "publicKeyHash": "ZVhwTYqTzCNgV16oq5xL0rSBMGRojETt21+DdgRXzyk=",
            "transactionId": "09e95dae77a116fa1a8fe2b049b8326ce5f9ff6f66ee8fd01289d05d19aa682e"
          }
        },
        "paymentMethod": {
          "displayName": "MasterCard 1471",
          "network": "MasterCard",
          "type": "debit"
        },
        "transactionIdentifier": "09E95DAE77A116FA1A8FE2B049B8326CE5F9FF6F66EE8FD01289D05D19AA682E"
      }
    }
  },
  "clientInfo": {
    "fingerprint": "d042b8eeada885f5bac8821d99101a09"
  }
}'
```

- пример ответа Платформы:

```json
{
    "clientInfo": {
        "fingerprint": "d042b8eeada885f5bac8821d99101a09",
        "ip": "2A04:4A00:5:1014::100D"
    },
    "paymentSession": "eyJjbGllbnRJbmZvIjp7ImZpbmdlcnByaW50IjoiZDA0MmI4ZWVhZGE4ODVmNWJhYzg4MjFkOTkxMDFhMDkiLCJpcCI6IjJBMDQ6NEEwMDo1OjEwMTQ6OjEwMEQifSwicGF5bWVudFNlc3Npb24iOiJJYW90VGV6SUhGSFVKVkJwbFNDWHkifQ",
    "paymentToolDetails": {
        "bin": "520424",
        "cardNumberMask": "520424******1471",
        "detailsType": "PaymentToolDetailsBankCard",
        "lastDigits": "1471",
        "paymentSystem": "mastercard",
        "tokenProvider": "applepay"
    },
    "paymentToolToken": "eyJiaW4iOiI1MjA0MjQiLCJtYXNrZWRfcGFuIjoiMTQ3MSIsInBheW1lbnRfc3lzdGVtIjoibWFzdGVyY2FyZCIsInRva2VuIjoiM25FN0s0ckdXVW91RzlVVjVJN2lMNyIsInRva2VuX3Byb3ZpZGVyIjoiYXBwbGVwYXkiLCJ0eXBlIjoiYmFua19jYXJkIn0"
}
```

- запускаем платеж в Платформе

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices/10vLw0XY144/payments \
  -H 'Authorization: Bearer {INVOICE_ACCESS_TOKEN}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1528470852' \
  -d '{
  "flow": {
    "type": "PaymentFlowInstant"
  },
  "payer": {
      "payerType": "PaymentResourcePayer",
    "paymentToolToken":"{PAYMENT_TOOL_TOKEN}",
    "paymentSession":"{PAYMENT_SESSION}",
    "contactInfo":
      {
        "email":"test@test.com",
        "phoneNumber":"9876543210"
      }
  }
}'
```

- проверяем статус обработки платежа, обрабатываем результат.
