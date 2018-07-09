Рекуррентные платежи, также известные как безакцептные списания, автоплатежи или регулярные платежи позволяют вам делать списания с карты плательщика без его участия и отображения формы ввода карточных данных.

Однако для того, чтобы такие платежи заработали необходимо произвести первый платеж с участием плательщика, показав ему форму ввода карточных данных.


## Бизнес-процесс

Платформа предоставляет возможность провести процесс привязки карты к плательщику, созданному внутри платформы. В виде взаимодействия с плательщиком это может выглядеть следующим образом:

- плательщик заходит в личный кабинет на вашем сайте;
- отображаем плательщику кнопку "Привязать карту";
- плательщик нажимает на кнопку, открывается форма ввода карточных данных;
- плательщик вводит данные карты и нажимает кнопку "Привязать карту" и соглашается с условиями безакцептных списаний;
- платформа в это время производит попытку списания и мгновенного возврата произвольной суммы (на момент написания этой версии документации - 10₽/1$/1€) с карты плательщика;
- в случае успешного списания платформа предоставляет возможность списывать средства с привязанной карты уже с вашего бекенда без участия плательщика.

!!!note
	Обратите внимание! Платформа не предоставляет возможность безусловных безакцептных списаний без предварительного явного процесса привязки карты! Безусловные рекуррентные платежи после первой успешной транзакции не предоставляются.

## Привязка карт и плательщики

На момент написания текущей версии статьи в один момент времени существует только одна активная привязка карты. Количество привязываемых к плательщику карт - неограничено. Активной становится последняя привязанная карта.

### Пример реализации с RBKmoney Checkout

- создаем плательщика в Платформе

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/customers \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1518694385' \
  -d '{
  "shopID": "TEST",
  "contactInfo": {
    "email": "user@example.com",
    "phoneNumber": "79876543210"
  },
  "metadata": {}
}'
```

- в ответ Платформа пришлет структуру вида

```json
{
    "customer": {
        "contactInfo": {
            "email": "user@example.com",
            "phoneNumber": "79876543210"
        },
        "id": "10UWY0qQpU0",
        "metadata": {},
        "shopID": "TEST",
        "status": "unready"
    },
    "customerAccessToken": {
        "payload": "{CUSTOMER_ACCESS_TOKEN}"
    }
}
```

- полученные `customer.id` и `customerAccessToken.payload` передаем в [RBKmoney Checkout](/checkout/#_3)

- плательщик вводит карточные данные в форму и нажимает "Привязать"

![checkout_binding.png](/payments/img/checkout_binding.png)

- проверяем состояние плательщика (либо обрабатываем соответствующий вебхук)

```bash
curl -X GET \
  https://api.rbk.money/v2/processing/customers/10UWY0qQpU0 \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1527070201'
```

- в случае успешной привязки объект плательщика переходит в состояние `ready`

```json
{
    "contactInfo": {
        "email": "user@example.com",
        "phoneNumber": "79876543210"
    },
    "id": "10UWY0qQpU0",
    "metadata": {},
    "shopID": "TEST",
    "status": "ready"
}
```

- стандартно создаем в Платформе инвойс

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1518694537' \
  -d '{
  "shopID": "TEST",
  "dueDate": "2018-02-15T12:35:34.293Z",
  "amount": 6000,
  "currency": "RUB",
  "product": "Заказ номер 12345",
  "description": "Изысканная кухня",
    "cart": [
        {
            "price": 5000,
            "product": "Бутерброд с сыром",
            "quantity": 1,
            "taxMode": {
                "rate": "10%",
                "type": "InvoiceLineTaxVAT"
            }
        },
        {
            "price": 1000,
            "product": "Компот",
            "quantity": 1,
            "taxMode": {
                "rate": "18%",
                "type": "InvoiceLineTaxVAT"
            }
        }
    ],  
"metadata": {}
}'
```

- однако, передаем не токен платежного средства, а ID нашего плательщика, а также указываем тип `"payerType": "CustomerPayer"`

```bash
curl -X POST \
  https://api.rbk.money/v1/processing/invoices/xtdikju7jk/payments \
  -H 'Authorization: Bearer {INVOICE_ACCESS_TOKEN}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1518694583' \
  -d '{
  "flow": {
    "type": "PaymentFlowInstant"
  },
  "payer": {
    "payerType": "CustomerPayer",
    "customerID": "xtdX5zlluy"
  }
}'
```

### Реализация с кастомной платежной формой

- получаем платежные токен и сессию с вашей формы ввода карточных данных

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/payment-resources \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1527071069' \
  -d '{
  "paymentTool": {
    "paymentToolType": "CardData",
    "cardNumber": "5169147129584558",
    "expDate": "12/20",
    "cvv": "123",
    "cardHolder": "SUCCESS CARD"
  },
  "clientInfo": {
  "fingerprint": "string"
}
}'
```

- платформа возвращает `paymentToolToken` и `paymentSession`

```json
{
    "clientInfo": {
        "fingerprint": "string",
        "ip": "2A04:4A00:5:1014::100D"
    },
    "paymentSession": "{PAYMENT_SESSION}",
    "paymentToolDetails": {
        "bin": "516914",
        "cardNumberMask": "516914******4558",
        "detailsType": "PaymentToolDetailsBankCard",
        "lastDigits": "4558",
        "paymentSystem": "mastercard"
    },
    "paymentToolToken": "{PAYMENT_TOOL_TOKEN}"
}
```

!!!note
	Обратите внимание! Привязка карт *всегда* требует прохождения процесса [3D-Secure](3dsecure.md)

- передаем полученные `paymentToolToken` и `paymentSession` в метод [createBinding](https://developer.rbk.money/api/#operation/createBinding)

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/customers/xtdX5zlluy/bindings \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1518694466' \
  -d '{
  "paymentResource": {
    "paymentToolToken": "{PAYMENT_TOOL_TOKEN}",
    "paymentSession": "{PAYMENT_SESSION}"
  }
}'
```

- запускаем поллинг событий плательщика

```bash
curl -X GET \
  'https://api.rbk.money/v2/processing/customers/10UWY0qQpU0/events?limit=100' \
  -H 'Authorization: Bearer {API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1527071300'
```

  - обрабатываем события плательщика точно таким же образом, как и платежа

  - после перехода плательщика в состояние `ready` создаем инвойсы и производим списания с плательщика как указано вы инструкции выше
