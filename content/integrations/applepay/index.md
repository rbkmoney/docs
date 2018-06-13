# Интеграция Apple Pay в RBKmoney API

Apple Pay — это метод токенизации карточных данных плательщика, который позволяет ускорить и упростить оплату ваших товаров и услуг. В случае, если у плательщика добавлена карта в приложении Apple Pay, он может оплачивать покупки, вводя не свои карточные данные, а используя кнопку "Покупка с Apple Pay". 

Для проведения платежа достаточно передать полученные из Apple Pay токенизированные карточные данные в RBKmoney API, создать инвойс в Платформе и оплатить его с помощью токена RBKmoney, который содержит в себе токен Apple Pay. Таким образом, при оплате производится процесс двойной токенизации - Платформа RBKmoney реализует в схожую бизнес-логику при проведении платежей, создавая на основе платежных данных токены, которые используются для запуска платежей.

!!! note
    Данная инструкция предназначена для тех, кто подключается как платежный процессинг, либо предпочитает верстать свою собственную платежную форму. Если вы используете [RBKmoney Checkout](/integrations/checkout/), то кнопка Apple Pay уже включена для ваших плательщиков, никаких дополнительных действий не требуется.

## "Buy with Apple Pay" в web-приложении

Для получения структуры данных Apple Pay, содержащих токен карточных данных, а также другие необходимые для запуска платежа данные, придется реализовать несколько бизнес-процессов, реализуемых в API Safari. Они заключаются в проверке возможности оплаты, запуске сессии, и т.н. валидации мерчанта, когда для запуска платежа нужно будет обратиться по специальному адресу бекенда RBKmoney.

Рассмотрим пример успешного платеже с тестовой карты Apple Pay с примерами кода на JavaScript.

!!!note
	Здесь и в дальшейшем будет использоваться тестовая карта MasterCard Apple Pay со следующими данными.
	PAN: **5204 2477 5000 1471**, Expiration Date: **11/2022**, CVC: **111**. Инструкция по созданию тестового аккаунта Apple и по привязке тестовой карты можно прочитать в официальной документации [https://developer.apple.com/apple-pay/sandbox-testing/](https://developer.apple.com/apple-pay/sandbox-testing/).


### Проверка возможности оплаты с помощью Apple Pay

Убедимся, что устройство или браузер поддерживает оплату с Apple Pay в принципе, а также то, что в в Wallet на устройстве добавлена карта, которой можно оплачивать покупки. Для проверки потребуется узнать идентификатор мерчанта.

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
	Используйте следующий идентификатор мерчанта тестовой среды RBKmoney: **merchant.rbk.money.checkout**. Для проведения боевых платежей вам необходимо будет получить идентификатор мерчанта, [обратившись к нам](mailto:support@rbk.money).

### Формируем структуру платежа для сессии

Задаем наиментование товара или услуги, указываем сумму, опционально - валюту платежа. Создаем новую сессию оплаты. Обратите внимание! Сумма платежа должна совпадать со стоимостью созданного в RBKmoney инвойса!

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

Для проверки возможности оплаты для вашего идентификатора мерчанта и получения необходимых данных для запуска платежа необходимо сформировать структуру данных, асинхронно передать ее на бекенд RBKmoney и обработать полученный коллбек.


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
	//после получения токена передаем его себе на бекенд
 
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

Если все было сделано корректно, ваш браузер или устройство поддерживают Apple Pay с привязанной картой, то отобразится такая кнопка:

<div class="apple-pay-button-with-text apple-pay-button-black-with-text" id="apple-pay-button" style="">
  <span class="text">Buy with</span>
  <span class="logo"></span>
</div>
<script src="applepay.js"></script>
<link rel="stylesheet" href="applepay.css">

### Собираем все вместе

Пример JS-кода.

```js
var domainName = 'applefags.rbkmoney.com';
var merchantIdentifier = 'merchant.money.rbk.checkout';
var paymentAmount = 10;
var merchantValidationEndpoint = 'https://wrapper.rbk.money/applepay/api/v1/session';
var displayName = 'RBKmoney Apple Pay Test';

if (window.ApplePaySession) {
    var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    promise.then(function(canMakePayments) {
        console.log(ApplePaySession.canMakePaymentsWithActiveCard);
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

## Интеграция Apple Pay в RBKmoney API

Для проведения платежа с Apple Pay необходимо выполнить следующие вызовы RBKmoney API:

- создать в Платформе инвойс, вызвав метод [createInvoice()](https://v2.api.developer.rbk.money/#operation/createInvoice);
- либо, если инвойс уже был создан ранее, создать [invoiceAccessToken](https://v2.api.developer.rbk.money/#operation/createInvoiceAccessToken);
- используя полученный `invoiceAccessToken` создать платежный токен RBKmoney, вызывав метод [createPaymentResource()](https://v2.api.developer.rbk.money/#operation/createPaymentResource);
- использовать полученный платежный токен RBKmoney для запуска одно- или двустадийных платежей.

### Пример структуры [paymentResourse](https://v2.api.developer.rbk.money/#operation/createPaymentResource)

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
    "merchantID": "rbkmoney",
    "paymentToken": {
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
  },
  "clientInfo": {
    "fingerprint": "aa32fec9f377e6fae19a6a8bcde41bd1"
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
  -H 'X-Request-ID: 1528470722' \
  -d '{
  "paymentTool": {
    "paymentToolType": "TokenizedCardData",
    "provider": "ApplePay",
    "merchantID": "rbkmoney",
    "paymentToken": {
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
  },
  "clientInfo": {
    "fingerprint": "aa32fec9f377e6fae19a6a8bcde41bd1"
  }
}'
```

- пример ответа Платформы:

```json
{
    "clientInfo": {
        "fingerprint": "aa32fec9f377e6fae19a6a8bcde41bd1",
        "ip": "2A04:4A00:5:1014::100D"
    },
    "paymentSession": "{PAYMENT_SESSION}",
    "paymentToolDetails": {
        "bin": "411111",
        "cardNumberMask": "411111******4444",
        "detailsType": "PaymentToolDetailsBankCard",
        "lastDigits": "4444",
        "paymentSystem": "mastercard",
        "tokenProvider": "Applepay"
    },
    "paymentToolToken": "{PAYMENT_TOOL_TOKEN}"
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

- проверяем статус обработки платежа:

```bash
curl -X GET \
  https://api.rbk.money/v2/processing/invoices/10vRl9xqGlk/payments/1 \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1528471100'
```

- пример ответа Платформы. Платеж успешно проведен:

```json
{
    "amount": 6000,
    "createdAt": "2018-06-08T15:18:06.834793Z",
    "currency": "RUB",
    "flow": {
        "type": "PaymentFlowInstant"
    },
    "id": "1",
    "invoiceID": "10vRl9xqGlk",
    "payer": {
        "clientInfo": {
            "fingerprint": "aa32fec9f377e6fae19a6a8bcde41bd1",
            "ip": "2A04:4A00:5:1014::100D"
        },
        "contactInfo": {
            "email": "test@test.com",
            "phoneNumber": "9876543210"
        },
        "payerType": "PaymentResourcePayer",
        "paymentSession": "{PAYMENT_SESSION}",
        "paymentToolDetails": {
            "bin": "411111",
            "cardNumberMask": "411111******4444",
            "detailsType": "PaymentToolDetailsBankCard",
            "lastDigits": "4444",
            "paymentSystem": "mastercard",
            "tokenProvider": "Applepay"
        },
        "paymentToolToken": "{PAYMENT_TOOL_TOKEN}"
    },
    "status": "captured"
}
```
