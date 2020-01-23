Рекуррентные платежи, также известные как безакцептные списания, автоплатежи или регулярные платежи позволяют вам делать списания с карты плательщика без его участия и отображения формы ввода карточных данных.

Однако для того, чтобы такие платежи заработали необходимо произвести первый платеж с участием плательщика, показав ему форму ввода карточных данных.

Платформа предоставляет несколько решений для организации безакцептных списаний - непрозрачные для плательщика, когда первый успешный платеж используется как родительский для последующих фоновых списаний и прозрачные, когда плательщику явным образом предлагается привязать карту для последующих списаний.

На момент написания текущей версии статьи сервисы [VAU](https://developer.visa.com/capabilities/vau/docs)/[ABU](https://developer.mastercard.com/product/automatic-billing-updater) платформой не обслуживаются, предоставляется только возможность безакцептного списания средств с карт плательщиков.

## Правила и ограничения

- плательщик должен явно согласиться с предоставлением своей карты для последующих рекуррентных платежей;
- в информационном уведомлении (чеке) о платеже должно указываться:
    - пометка "recurring transaction" ("периодическая операция", "транзакция на основании постоянного поручения");
    - расписание платежа (по какому графику производятся регулярные списания);
    - время жизни подписки (до какого срока плательщик дал согласие на оплату).
- в случае получения ошибки рекуррентного платежа создание повторных попыток списания допускается не чаще 1 раза в сутки на протяжении не более 31 дней.

## Рекуррентные списания по первому платежу

Перед началом использования фоновых безакцепнтых списаний с вашего бекэнда, необходимо произвести первый инициирующий платеж, а также уведомить плательщика, что данная карта будет использоваться для регулярных платежей в дальнейшем.

!!!note
    Необходимо явным образом получить согласие плательщика на последующие фоновые списания размещением соответствующего поля для установки флажка (checkbox) с согласием. При необходимости нужно иметь возможность предоставить данные, подтверждающие отметку этого флажка плательщиком.

В дальнейшем идентификаторы успешных родительских инвойса и платежа достаточно будет передавать параметрами в функцию создания нового платежа.

!!!note
    В связи с рекомендациями международных платежных систем не делать перерыва более 6 месяцев между двумя рекуррентными платежами, мы рекомендуем для каждого последующего рекуррентного платежа использовать идентификаторы предыдущего, а не первого родительского.

### Интеграция без использования Checkout

- создаем в платформе инвойс

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1538484422' \
  -d '{
  "shopID": "TEST",
  "dueDate": "2018-09-28T09:57:12.183Z",
  "amount": 1000,
  "currency": "RUB",
  "product": "Recurring Parent #1",
  "description": "Delicious meals",
"metadata": 
  { 
    "order_id": "Internal order num 13123298761"
  }
}'
```

- пример ответа платформы

```json
{
    "invoice": {
        "amount": 1000,
        "createdAt": "2018-10-02T12:52:42.489022Z",
        "currency": "RUB",
        "description": "Delicious meals",
        "dueDate": "2018-10-02T13:52:43.623000Z",
        "id": "141oE76atY8",
        "metadata": {
            "order_id": "Internal order num 13123298761"
        },
        "product": "Recurring Parent #1",
        "shopID": "TEST",
        "status": "unpaid"
    },
    "invoiceAccessToken": {
        "payload": "{INVOICE_ACCESS_TOKEN}"
    }
}
```

- запускам по инвойсу платеж, сообщая платформе, что он должен стать родительским рекуррентным платежом, передавая `"makeRecurrent": true`;
- платеж может запускаться как по одностадийной (Instant), так и двухстадийной (Hold) схеме:

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices/141oE76atY8/payments \
  -H 'Authorization: Bearer {INVOICE_ACCESS_TOKEN}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1538484795' \
  -d '{
  "flow": {
    "type": "PaymentFlowInstant"
  },
  "payer": {
      "payerType": "PaymentResourcePayer",
    "paymentToolToken":"{PAYMENT_TOOL_TOKEN}",
    "contactInfo":
      {
        "email":"test@test.com",
        "phoneNumber":"9876543210"
      }
  },
  "makeRecurrent": true
}'
```

- пример ответа платформы:

```json
{
    "amount": 1000,
    "createdAt": "2018-10-02T12:55:29.471382Z",
    "currency": "RUB",
    "flow": {
        "type": "PaymentFlowInstant"
    },
    "id": "1",
    "invoiceID": "141oE76atY8",
    "makeRecurrent": true,
    "payer": {
        "clientInfo": {
            "fingerprint": "123",
            "ip": "2A04:4A00:5:1014::100D"
        },
        "contactInfo": {
            "email": "test@test.com",
            "phoneNumber": "9876543210"
        },
        "payerType": "PaymentResourcePayer",
        "paymentSession": "{PAYMENT_SESSION}",
        "paymentToolDetails": {
            "bin": "424242",
            "cardNumberMask": "424242******4242",
            "detailsType": "PaymentToolDetailsBankCard",
            "lastDigits": "4242",
            "paymentSystem": "visa"
        },
        "paymentToolToken": "{PAYMENT_TOOL_TOKEN}"
    },
    "status": "pending"
}
```

- в большинстве случаев мы будем требовать прохождения 3D-Secure для успешной обработки подобных платежей;
- обрабатываем платеж как обычный и убеждаемся в его переходе в успешное состояние:

```bash
curl -X GET \
  https://api.rbk.money/v2/processing/invoices/141oE76atY8/payments/1 \
  -H 'Authorization: Bearer {INVOICE_ACCESS_TOKEN}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1538485221'
```

- пример ответа платформы, платеж успешен:

```json
{
    "amount": 1000,
    "createdAt": "2018-10-02T12:55:29.471382Z",
    "currency": "RUB",
    "flow": {
        "type": "PaymentFlowInstant"
    },
    "id": "1",
    "invoiceID": "141oE76atY8",
    "makeRecurrent": true,
    "payer": {
        "clientInfo": {
            "fingerprint": "123",
            "ip": "2A04:4A00:5:1014::100D"
        },
        "contactInfo": {
            "email": "test@test.com",
            "phoneNumber": "9876543210"
        },
        "payerType": "PaymentResourcePayer",
        "paymentSession": "{PAYMENT_SESSION}",
        "paymentToolDetails": {
            "bin": "424242",
            "cardNumberMask": "424242******4242",
            "detailsType": "PaymentToolDetailsBankCard",
            "lastDigits": "4242",
            "paymentSystem": "visa"
        },
        "paymentToolToken": "{PAYMENT_TOOL_TOKEN}"
    },
    "status": "captured"
}
```

- теперь у нас имеются идентификаторы успешных родительских инвойса `141oE76atY8` и платежа `1`, мы используем их в следующем вызове создания платежа уже без участия плательщика и ввода карты;
- для начала создаем в платформе новый инвойс:

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1538485363' \
  -d '{
  "shopID": "TEST",
  "dueDate": "2018-10-02T13:52:43.623Z",
  "amount": 1000,
  "currency": "RUB",
  "product": "Recurring Child #1",
  "description": "Delicious meals",
"metadata": 
  { 
    "order_id": "Internal order num 13123298761"
  }
}'
```

- пример ответа платформы:

```json
{
    "invoice": {
        "amount": 1000,
        "createdAt": "2018-10-02T13:02:58.058595Z",
        "currency": "RUB",
        "description": "Delicious meals",
        "dueDate": "2018-10-02T14:02:59.155000Z",
        "id": "141oxZOgbmy",
        "metadata": {
            "order_id": "Internal order num 13123298761"
        },
        "product": "Recurring Child #1",
        "shopID": "TEST",
        "status": "unpaid"
    },
    "invoiceAccessToken": {
        "payload": "{INVOICE_ACCESS_TOKEN}"
    }
}
```

- оплатим этот инвойс с помощью рекуррентного платежа, передав идентификаторы предыдущего родительского платежа;
- также пометим этот платеж как родительский для следующих рекуррентных платежей:

```bash
curl -X POST \
  https://api.rbk.money/v2/processing/invoices/141oxZOgbmy/payments \
  -H 'Authorization: Bearer {INVOICE_ACCESS_TOKEN}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1538485479' \
  -d '{
  "flow": {
    "type": "PaymentFlowHold",
    "onHoldExpiration": "cancel"
  },
  "payer": {
      "payerType": "RecurrentPayer",
    "recurrentParentPayment": {
      "invoiceID": "141oE76atY8",
      "paymentID": "1"
    },
    "contactInfo":
      {
        "email":"test@test.com",
        "phoneNumber":"9876543210"
      }
  },
  "makeRecurrent": true
}'
```

- платеж успешно создан:

```json
{
    "amount": 1000,
    "createdAt": "2018-10-02T13:04:33.717364Z",
    "currency": "RUB",
    "flow": {
        "heldUntil": "2018-10-03T13:04:33Z",
        "onHoldExpiration": "cancel",
        "type": "PaymentFlowHold"
    },
    "id": "1",
    "invoiceID": "141oxZOgbmy",
    "makeRecurrent": true,
    "payer": {
        "contactInfo": {
            "email": "test@test.com",
            "phoneNumber": "9876543210"
        },
        "payerType": "RecurrentPayer",
        "recurrentParentPayment": {
            "invoiceID": "141oE76atY8",
            "paymentID": "1"
        }
    },
    "status": "pending"
}
```

- убедимся, что платеж прошел успешно:

```json
{
    "amount": 1000,
    "createdAt": "2018-10-02T13:04:33.717364Z",
    "currency": "RUB",
    "flow": {
        "heldUntil": "2018-10-03T13:04:33Z",
        "onHoldExpiration": "cancel",
        "type": "PaymentFlowHold"
    },
    "id": "1",
    "invoiceID": "141oxZOgbmy",
    "makeRecurrent": true,
    "payer": {
        "contactInfo": {
            "email": "test@test.com",
            "phoneNumber": "9876543210"
        },
        "payerType": "RecurrentPayer",
        "recurrentParentPayment": {
            "invoiceID": "141oE76atY8",
            "paymentID": "1"
        }
    },
    "status": "captured"
}
```

- теперь мы можем использовать этот платеж как родительский, используя его идентификаторы `141oxZOgbmy` и `1` для оплаты последующих инвойсов.

### Интеграция c использованием Checkout

Алгоритм интеграции полностью соответствует вышеописанному, за исключением того, что вызовы createPayment() выполняются самой платежной формой, а также параметром Checkout API необходимо передать `recurring = true`

## Рекуррентные платежи по привязанной карте

Платформа предоставляет возможность провести процесс привязки карты к плательщику, созданному внутри платформы. В виде взаимодействия с плательщиком это может выглядеть следующим образом:

- плательщик заходит в личный кабинет на вашем сайте;
- отображаем плательщику кнопку "Привязать карту";
- плательщик нажимает на кнопку, открывается форма ввода карточных данных;
- плательщик вводит данные карты и нажимает кнопку "Привязать карту" и соглашается с условиями безакцептных списаний;
- платформа в это время производит попытку списания и мгновенного возврата произвольной суммы (на момент написания этой версии документации - 10₽/1$/1€) с карты плательщика;
- в случае успешного списания платформа предоставляет возможность списывать средства с привязанной карты уже с вашего бекэнда без участия плательщика.

### Привязка карт и плательщики

На момент написания текущей версии статьи в один момент времени существует только одна активная привязка карты. Количество привязываемых к плательщику карт – не ограничено. Активной становится последняя привязанная карта.

#### Пример реализации с RBKmoney Checkout

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

- полученные `customer.id` и `customerAccessToken.payload` передаем в [RBKmoney Checkout](/docs/payments/checkout/#_3)

- плательщик вводит карточные данные в форму и нажимает "Привязать"

![checkout_binding.png](/docs/payments/img/checkout_binding.png)

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

#### Реализация с собственной платежной формой

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

- после перехода плательщика в состояние `ready` создаем инвойсы и производим списания с плательщика как указано вы инструкции выше.
