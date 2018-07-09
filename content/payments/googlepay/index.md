# Интеграция Google Pay в RBKmoney API

Google Pay — это метод токенизации карточных данных плательщика, который позволяет ускорить и упростить оплату ваших товаров и услуг. В случае, если у плательщика добавлена карта в приложении Google Pay, он может оплачивать покупки, вводя не свои карточные данные, а используя кнопку "Покупка с Google Pay". 

Для проведения платежа достаточно передать полученные из Google Pay токенизированные карточные данные в RBKmoney API, создать инвойс в Платформе и оплатить его с помощью токена RBKmoney, который содержит в себе токен Google Pay. Таким образом, при оплате производится процесс двойной токенизации - Платформа RBKmoney реализует в схожую бизнес-логику при проведении платежей, создавая на основе платежных данных токены, которые используются для запуска платежей.

!!! note
    Данная инструкция предназначена для тех, кто подключается как платежный процессинг, либо предпочитает верстать свою собственную платежную форму. Если вы используете [RBKmoney Checkout](/checkout/), то кнопка Google Pay уже включена для ваших плательщиков, никаких дополнительных действий не требуется. Ознакомиться с условиями оказания услуг Google Pay вы можете по адресу [https://pay.google.com/about/terms/](https://pay.google.com/about/terms/).

## Пример интеграции кнопки "Pay with Google Pay"

На момент написания статьи используется официальная документация разработчика Google по адресу [https://developers.google.com/pay/api/web/guides/tutorial](https://developers.google.com/pay/api/web/guides/tutorial), а также гайдлайны фирменного стиля Google, описанные по адресу [https://developers.google.com/pay/api/web/guides/brand-guidelines](https://developers.google.com/pay/api/web/guides/brand-guidelines).

В качестве параметров скрипта укажите:

- доступные методы платежа:

```js
var allowedPaymentMethods = ['CARD', 'TOKENIZED_CARD'];
```

- тип токенизации - `PAYMENT_GATEWAY`:

```js
tokenizationType: 'PAYMENT_GATEWAY'
```

- для тестового окружения укажите значения `gateway` и `gatewayMerchantId` как `rbkmoney`:

```js
'gateway': 'rbkmoney',
'gatewayMerchantId': 'rbkmoney'
```

!!! note
    Указанный merchantId используется для тестов. Для получения боевого merchantId [обратитесь к нам](mailto:support@rbk.money).

Если вы все сделали правильно, то у вас на сайте появится такая кнопка:

  <div id="container"></div>

<script>
/**
 * Payment methods accepted by your gateway
 *
 * @todo confirm support for both payment methods with your gateway
 */
var allowedPaymentMethods = ['CARD', 'TOKENIZED_CARD'];

/**
 * Card networks supported by your site and your gateway
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#CardRequirements|CardRequirements}
 * @todo confirm card networks supported by your site and gateway
 */
var allowedCardNetworks = ['MASTERCARD', 'VISA'];

/**
 * Identify your gateway and your site's gateway merchant identifier
 *
 * The Google Pay API response will return an encrypted payment method capable of
 * being charged by a supported gateway after shopper authorization
 *
 * @todo check with your gateway on the parameters to pass
 * @see {@link https://developers.google.com/pay/api/web/reference/object#Gateway|PaymentMethodTokenizationParameters}
 */
var tokenizationParameters = {
  tokenizationType: 'PAYMENT_GATEWAY',
  parameters: {
    'gateway': 'rbkmoney',
    'gatewayMerchantId': 'rbkmoney'
  }
}

/**
 * Initialize a Google Pay API client
 *
 * @returns {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
  return (new google.payments.api.PaymentsClient({environment: 'TEST'}));
}

/**
 * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
 */
function onGooglePayLoaded() {
  var paymentsClient = getGooglePaymentsClient();
  paymentsClient.isReadyToPay({allowedPaymentMethods: allowedPaymentMethods})
      .then(function(response) {
        if (response.result) {
          addGooglePayButton();
          prefetchGooglePaymentData();
        }
      })
      .catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
      });
}

/**
 * Add a Google Pay purchase button alongside an existing checkout button
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#ButtonOptions|Button options}
 * @see {@link https://developers.google.com/pay/api/web/guides/brand-guidelines|Google Pay brand guidelines}
 */
function addGooglePayButton() {
  var paymentsClient = getGooglePaymentsClient();
  var button = paymentsClient.createButton({onClick:onGooglePaymentButtonClicked});
  document.getElementById('container').appendChild(button);
}

/**
 * Configure support for the Google Pay API
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentDataRequest|PaymentDataRequest}
 * @returns {object} PaymentDataRequest fields
 */
function getGooglePaymentDataConfiguration() {
  return {
    // @todo a merchant ID is available for a production environment after approval by Google
    // @see {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
    merchantId: '01234567890123456789',
    paymentMethodTokenizationParameters: tokenizationParameters,
    allowedPaymentMethods: allowedPaymentMethods,
    cardRequirements: {
      allowedCardNetworks: allowedCardNetworks
    }
  };
}

/**
 * Provide Google Pay API with a payment amount, currency, and amount status
 *
 * @see {@link https://developers.google.com/pay/api/web/reference/object#TransactionInfo|TransactionInfo}
 * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
 */
function getGoogleTransactionInfo() {
  return {
    currencyCode: 'RUB',
    totalPriceStatus: 'FINAL',
    // set to cart total
    totalPrice: '10.00'
  };
}

/**
 * Prefetch payment data to improve performance
 */
function prefetchGooglePaymentData() {
  var paymentDataRequest = getGooglePaymentDataConfiguration();
  // transactionInfo must be set but does not affect cache
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
    currencyCode: 'RUB'
  };
  var paymentsClient = getGooglePaymentsClient();
  paymentsClient.prefetchPaymentData(paymentDataRequest);
}

/**
 * Show Google Pay chooser when Google Pay purchase button is clicked
 */
function onGooglePaymentButtonClicked() {
  var paymentDataRequest = getGooglePaymentDataConfiguration();
  paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

  var paymentsClient = getGooglePaymentsClient();
  paymentsClient.loadPaymentData(paymentDataRequest)
      .then(function(paymentData) {
        // handle the response
        processPayment(paymentData);
      })
      .catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
      });
}

/**
 * Process payment data returned by the Google Pay API
 *
 * @param {object} paymentData response from Google Pay API after shopper approves payment
 * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentData|PaymentData object reference}
 */
function processPayment(paymentData) {
  // show returned data in developer console for debugging
  console.log(JSON.stringify(paymentData));
  // @todo pass payment data response to gateway to process payment
}
</script>
<script async
  src="https://pay.google.com/gp/p/js/pay.js"
  onload="onGooglePayLoaded()"></script>

После нажатия кнопки на устройстве с подключенным Google Pay появится всплывающее окно или форма выбора привязанной карты. В случае подтверждения плательщиком оплаты коллбек вернет в функцию `processPayment` данные, необходимые для получения [платежного токена](https://developer.rbk.money/api/#operation/createPaymentResource) RBKmoney.

## Пример набора данных, возвращаемых Google Pay

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

!!! note
    Встроенный в эту документацию скрипт логгирует данные Google Pay в консоль вашего браузера. Вы можете просмотреть их и использовать для тестовых нужд. 
    Обратите внимание! В Google Pay отсутствует возможность привязать тестовую карту, поэтому интерфейс вам будет показывать вашу реальную карту. Однако в тестовой среде Google эта карта непрозрачно подменяется на тестовую и вам в скрипт возвращаются данные тестовой карты. Таким образом вы можете безопасно использовать вашу привязанную реальную карту, средства с нее списаны не будут.

## Интеграция Google Pay в RBKmoney API

Для проведения платежа с Google Pay необходимо выполнить следующие вызовы RBKmoney API:

- создать в Платформе инвойс, вызвав метод [createInvoice()](https://developer.rbk.money/api/#operation/createInvoice);
- либо, если инвойс уже был создан ранее, создать [invoiceAccessToken](https://developer.rbk.money/api/#operation/createInvoiceAccessToken);
- используя полученный `invoiceAccessToken` создать платежный токен RBKmoney, вызывав метод [createPaymentResource()](https://developer.rbk.money/api/#operation/createPaymentResource);
- использовать полученный платежный токен RBKmoney для запуска одно- или двустадийных платежей.

### Пример структуры [paymentResourse](https://developer.rbk.money/api/#operation/createPaymentResource)

#### Необходимые данные

- в переменной `paymentToolType` укажите значение `TokenizedCardData`;
- в переменной `provider` укажите `GooglePay`;
- в переменной `merchantID`:
    - для тестовой среды укажите `rbkmoney`;
    - для боевой среды укажите идентификатор вашего мерчанта, выданный вам RBKmoney.
- в структуру `paymentToken` передайте структуру, полученную из Google Pay.

#### Пример корректно заполненной структуры

```json
{
  "paymentTool": {
    "paymentToolType": "TokenizedCardData",
    "provider": "GooglePay",
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

Ниже приведена цепочка `curl` вызовов к API RBKmoney, позволяющая провести платеж с использованием платежного метода Google Pay.

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

- обрабатываем в UA плательщика бизнес-процесс Google Pay, передаем полученные данные себе на бекэнд и вызываем createPaymentResource():

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
    "provider": "GooglePay",
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
        "tokenProvider": "googlepay"
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
            "tokenProvider": "googlepay"
        },
        "paymentToolToken": "{PAYMENT_TOOL_TOKEN}"
    },
    "status": "captured"
}
```
