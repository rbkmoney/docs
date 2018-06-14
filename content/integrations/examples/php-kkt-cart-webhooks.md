Пример полной интеграции приема платежей с банковских карт с серверным кодом на PHP, использованием Checkout HTML API, корзины товаров в инвойсе, пригодной для использования онлайн-касс (54-ФЗ), платежей с удержанием (холдированные платежи) и вебхуков.

## Сценарий интеграции

Представим, что мы проводим интеграцию платежной платформы RBKmoney для нашего интернет-магазина, продающего обеды с доставкой по предоплате. Движок магазина написан на PHP. У предпринимателя, владеющего магазином подключена онлайн-касса для соответствия 54-ФЗ. Важный нюанс: привередливые клиенты могут отказаться от заказа, если он будет доставлен с опозданием.

## Выбор технических подходов

- поскольку у нас есть интернет-магазин с конкретными заказчиками, идентифицировать которых мы можем заранее, а оплата заказов в нашем магазине производится за конкретные товарные позиции конкретного заказчика, мы выбираем [инвойсинговую схему](https://developer.rbk.money/api/#tag/Invoices) интеграции с RBKmoney;
- для интеграции платежей с онлайн-кассой нам потребуется список товарных позиций, их стоимость и ставка налогообложения. Нам понадобится структура cart метода [createInvoice](https://developer.rbk.money/api/#operation/createInvoice);
- поскольку вероятность отказа от заказа повышена, мы выбираем холдированные платежи, позволяющие в течение 3 суток с момента успешного запуска платежа, сделать [отмену этого платежа](https://developer.rbk.money/api/#operation/cancelPayment) без комиссии;
- для того, чтобы убедиться, что заказ действительно был оплачен и мы можем отправлять курьера, мы должны будем получить авторизованное сообщение об успешной оплате. Для этого используем [вебхуки](https://developer.rbk.money/api/webhooks) от платформы.

## Сценарий взаимодействия

1. Плательщик делает заказ, заполняет данные для доставки и подтверждает заказ в нашем интернет-магазине;
1. Наш интернет-магазин отображает кнопку оплаты, нажав на которую, плательщик увидит готовую платежную форму, введет данные карты и оплатит заказ;
1. После успешной оплаты заказа платежная форма перенаправляет плательщика на страницу успеха, где мы сообщаем, что заказ начал комплектоваться;
1. Платформа RBKmoney уведомит наш магазин об изменении статуса платежа на "Успешный", прислав подписанный JSON на адрес обработчика вебхуков нашего магазина;
1. Мы запускаем процесс комплектации заказа и его доставки;
1. Неуспешный случай. Плательщик отказывается от заказа, мы возвращаем ему оплату назад на карту;
1. Успешный случай. Создаем новый заказ, доставляем плательщику, мы подтверждаем списание денег с карты.

## Пример возможной реализации

Предположим, что у нас были заказаны 1 бутерброд с сыром, стоимостью 50₽, напиток за 25₽, а доставка у нас стоит 10₽. Адрес плательщика: hungry-man@email.ru

!!!note
    Все действия будем проводить в тестовом магазине с использованием данных [тестовых карт](https://developer.rbk.money/docs/refs/testcards/). Технически это ничем не отличается от реального приема платежей, кроме отсутствия движения реальных денег, поэтому для боевой интеграции нам достаточно будет только поменять ID магазина с '{ ... }' на ID боевого магазина.

### 1. Создание инвойса

После получения заказа от плательщика нам известна сумма заказа, товары, которые он заказал и его email. Этого достаточно для создания инвойса в RBKmoney. Для авторизации создания инвойсов мы сходили в личный кабинет и скопировали значение нашего [персонального ключа](https://dashboard.rbk.money/shop/{ ... }/key) для нашего тестового магазина. Не забываем, что это приватный ключ, который должен находиться только на нашем бэкенде внутри PHP-кода.

Теперь мы можем на нашем бэкенде написать код, который, собственно, создаст нам инвойс:

```php
<?php

$apiKey = "eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InU3cFpGVHh6QkEiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMudTdwWkVsZ1dreS5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy51N3BaRWxnV2t5OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.5kzCh5ykQNb9jAFGMN_S8i6ZKBzw8W4jrV6e9L2iD35cWoIaiAPb3pVGgIFow19rByqE1ZaOhupz8oglryvp_A";

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.rbk.money/v1/processing/invoices",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\n  \"shopID\": \"TEST\",\n  \"dueDate\": \"2017-09-27T15:21:51.002Z\",\n  \"amount\": 8500,\n  \"currency\": \"RUB\",\n  \"product\": \"Заказ номер 12345\",\n  \"description\": \"Изысканная кухня\",\n    \"cart\": [\n        {\n            \"price\": 5000,\n            \"product\": \"Бутерброд с сыром\",\n            \"quantity\": 1,\n            \"taxMode\": {\n                \"rate\": \"10%\",\n                \"type\": \"InvoiceLineTaxVAT\"\n            }\n        },\n        {\n            \"price\": 2500,\n            \"product\": \"Компот\",\n            \"quantity\": 1,\n            \"taxMode\": {\n                \"rate\": \"18%\",\n                \"type\": \"InvoiceLineTaxVAT\"\n            }\n        },\n        {\n            \"price\": 1000,\n            \"product\": \"Доставка\",\n            \"quantity\": 1,\n            \"taxMode\": {\n                \"rate\": \"18%\",\n                \"type\": \"InvoiceLineTaxVAT\"\n            }\n        }\n    ],  \n\"metadata\": \n  { \n    \"order_id\": \"ID заказа во внутренней CRM: 13123298761\"\n  }\n}",
  CURLOPT_HTTPHEADER => prepare_headers($apiKey),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}

function prepare_headers($apiKey)
{
    $headers = [];
    $headers[] = 'X-Request-ID: ' . uniqid();
    $headers[] = 'Authorization: Bearer ' . $apiKey;
    $headers[] = 'Content-type: application/json; charset=utf-8';
    $headers[] = 'Accept: application/json';
    return $headers;
}
```

Если мы все сделали верно, в ответ нам вернулась структура вида

```json
{
    "invoice": {
        "amount": 8500,
        "cart": [
            {
                "cost": 5000,
                "price": 5000,
                "product": "Бутерброд с сыром",
                "quantity": 1,
                "taxMode": {
                    "rate": "10%",
                    "type": "InvoiceLineTaxVAT"
                }
            },
            {
                "cost": 2500,
                "price": 2500,
                "product": "Компот",
                "quantity": 1,
                "taxMode": {
                    "rate": "18%",
                    "type": "InvoiceLineTaxVAT"
                }
            },
            {
                "cost": 1000,
                "price": 1000,
                "product": "Доставка",
                "quantity": 1,
                "taxMode": {
                    "rate": "18%",
                    "type": "InvoiceLineTaxVAT"
                }
            }
        ],
        "createdAt": "2017-09-27T14:21:51.158840Z",
        "currency": "RUB",
        "description": "Изысканная кухня",
        "dueDate": "2017-09-27T15:21:51.002000Z",
        "id": "u7o9gfIwPA",
        "metadata": {
            "order_id": "ID заказа во внутренней CRM: 13123298761"
        },
        "product": "Заказ номер 12345",
        "shopID": "TEST",
        "status": "unpaid"
    },
    "invoiceAccessToken": {
        "payload": "eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InU3cFpGVHh6QkEiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMudTdwWkVsZ1dreS5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy51N3BaRWxnV2t5OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.5kzCh5ykQNb9jAFGMN_S8i6ZKBzw8W4jrV6e9L2iD35cWoIaiAPb3pVGgIFow19rByqE1ZaOhupz8oglryvp_A"
    }
}
```

Важные данные, которые мы получили в ответ - это id": "u7o9gfIwPA" и "invoiceAccessToken". Эти данные нам понадобятся для следующего шага - подготовки платежной формы и кнопки "Оплатить".

### 2. Инициализация платежной формы

Подготавливаем HTML, который нарисует в браузере плательщика кнопку "Оплатить", а при нажатии на нее - откроет платежную форму RBKmoney в полупрозрачном iFrame поверх нашего интернет-магазина. После успешной оплаты платежная форма сделает переадресацию на страницу успеха нашего магазина.

Для того, чтобы платёжная форма запустила холдированный платеж, устанавливаем флаг параметра `paymentFlowHold`, а также, устанавливаем политику того, что делать по окончании срока холдирования. `holdExpiration=cancel` по истечении срока вернет деньги плательщику, `holdExpiration=capture` - спишет их в нашу пользу.

```html
<form action="https://your-web-site.address/success.action.php" method="GET">
    <script src="https://checkout.rbk.money/checkout.js" class="rbkmoney-checkout"
            data-invoice-id="u7o9gfIwPA"
            data-invoice-access-token="eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InU3cFpGVHh6QkEiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMudTdwWkVsZ1dreS5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy51N3BaRWxnV2t5OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.5kzCh5ykQNb9jAFGMN_S8i6ZKBzw8W4jrV6e9L2iD35cWoIaiAPb3pVGgIFow19rByqE1ZaOhupz8oglryvp_A"
            data-payment-flow-hold="true"
            data-hold-expiration="capture"            
            data-name="Заказ №12345"
            data-email='hungry-man@email.ru'
            data-logo="https://checkout.rbk.money/images/logo.png"
            data-label="Оплатить с карты"
            data-description="Изысканная кухня"
            data-pay-button-label="Оплатить">
    </script>
</form>
```

Интеграция практически завершена. Теперь мы можем отдать сформированный HTML-код в браузер плательщика.

Если все сделано правильно, то появится такая кнопка:

<form action="#3" method="GET">
    <script src="https://checkout.rbk.money/checkout.js" class="rbkmoney-checkout"
            data-invoice-template-id="u7pZElgWky"
            data-invoice-template-access-token="eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InU3cFpGVHh6QkEiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMudTdwWkVsZ1dreS5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy51N3BaRWxnV2t5OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.5kzCh5ykQNb9jAFGMN_S8i6ZKBzw8W4jrV6e9L2iD35cWoIaiAPb3pVGgIFow19rByqE1ZaOhupz8oglryvp_A"
            data-name="Заказ №12345"
            data-email="hungry-man@email.ru"
            data-logo="https://checkout.rbk.money/images/logo.png"
            data-label="Оплатить с карты"
            data-description="Изысканная кухня"
            data-pay-button-label="Оплатить">
    </script>
    <script>
        (function checkIntegrationLoaded(self) {
            setTimeout(function() {
                var rbkmoneyButtons = document.getElementsByClassName('rbkmoney-button');
                if (rbkmoneyButtons) {
                    rbkmoneyButtons[0].nextElementSibling.remove();
                } else {
                    check(self);
                }
            }, 300);
        })(this);
    </script>
</form>

### 3. Проверка успеха платежа с помощью вебхука

До того, как мы отправим заказ на комплектацию и доставку, нам нужно убедиться, что оплата действительно была произведена. Доверять браузеру плательщика мы, естественно, не можем, но мы можем доверять платформе RBKmoney. Разумеется, если ее запрос подписан приватным ключом платформы.

Создаем вебхук в соответсвующем разделе личного кабинета. В нашей реализации нам будут интересны некоторые события группы Payment, отмечаем их:

- PaymentProcessed - платеж успешно обработан (средства захолдированы)
- PaymentCaptured - платеж успешно принят (захолдированные средства списаны)
- PaymentCancelled - платеж отменен (захолдированные средства возвращены)

После успешной оплаты с холдированием на URL обработки вебхуков нашего магазина платформа пришлет сообщение вида:
```json
Content-Signature: alg=RS256; digest=dwIGRnwI67mi36Z-CUTuXpo_4dGKtWXFpQXW_9aab4Nave9CaJVjP9FJtPSiWM_6Va3OFhch8nIsCEQggSTwWWraRDHCg_Y7GD0_yAfPGS5iWtxtBvHGFNKRQKFcI72wQFXfUWS8HroUTEmeZVb6pxIzyLOKMjEMD_JRZizxER6DCOFKsXgvl8NZfeOqiD6ZEP2IwxRCi0wnHJWF3IcMRs5lP6YiIXnXXQGGLKnqij8jt0cUELI0gDChWbJlX0lLB4c_A8r9PNm7aGrAqrAMxJmDgH0IlUTl21g7LrCWNhd_FAhcPaVSjwgHTBYRY2GFcoe5u6PnLWChn7dDW66XwA==
Content-Type: application/json; charset=utf-8
Content-Length: 706
Host: localhost:8088
Connection: Keep-Alive
Accept-Encoding: gzip
User-Agent: okhttp/3.6.0

{
  "eventID": 2006462,
  "eventType": "PaymentProcessed",
  "invoice": {
    "amount": 8500,
    "createdAt": "2017-09-27T16:25:35.995166Z",
    "currency": "RUB",
    "description": "Изысканная кухня",
    "dueDate": "2018-10-28T16:25:35Z",
    "id": "u7wzxUVbZg",
    "metadata": {},
    "product": "Заказ №12345",
    "shopID": "TEST",
    "status": "unpaid"
  },
  "occuredAt": "2017-09-27T16:25:37.505396Z",
  "payment": {
    "amount": 8500,
    "contactInfo": {
      "email": "hungry-man@email.ru"
    },
    "createdAt": "2017-09-27T16:25:36.876168Z",
    "currency": "RUB",
    "fingerprint": "1f595464b38a9276b6ab61399417a5c3",
    "id": "1",
    "ip": "2A04:4A00:5:1014::100D",
    "paymentSession": "5CNNzitToqjmpuEajuOKnG",
    "paymentToolToken": "7TjB6PA3CZtdHLTjVD1Pig",
    "status": "processed"
  },
  "topic": "InvoicesTopic"
}
```

Теперь нам достаточно проверить подпись, присланную в заголовке `Content-Signature`. Код для проверки может выглядеть так:

```php
<?php

// Достаем сигнатуру из заголовка и декодируем
$signatureFromHeader = get_signature_from_header($_SERVER['HTTP_CONTENT_SIGNATURE']);

function get_signature_from_header($contentSignature) {
        $signature = preg_replace("/alg=(\S+);\sdigest=/", '', $contentSignature);

        if (empty($signature)) {
            throw new Exception('Signature is missing');
        }

        return $signature;
}


// Декодируем данные
$decodedSignature = urlsafe_base64decode($signatureFromHeader);
function urlsafe_base64decode($string) {
    return base64_decode(strtr($string, '-_,', '+/='));
}


// Данные, которые пришли в теле сообщения
$content = file_get_contents('php://input');

/**
 * Публичный ключ - ключ для обработки уведомлений о смене статуса
 * 
 * Заходим в личный кабинет RBKmoney: Создать Webhook;
 * Вставляем в поле URL на который будут приходить уведомления
 * Выбираем Типы событий, например: InvoicePaid и InvoiceCanсelled;
 * После создания Webhook-а копируем Публичный ключ после нажатия на Показать детали;
 * Копируем Публичный ключ полностью с заголовками ---- BEGIN PUB...;
 */
$webhookPublicKey = 'your webhook public key';
if(!verify_signature($content, $decodedSignature, $webhookPublicKey)) {
    http_response_code(400);
    echo json_encode(['message' => 'Webhook notification signature mismatch']);
    exit();
}

// Проверяем сигнатуру
function verify_signature($data, $signature, $publicKey) {
    if (empty($data) || empty($signature) || empty($publicKey)) {
        return FALSE;
    }

    $publicKeyId = openssl_get_publickey($publicKey);
    if (empty($publicKeyId)) {
        return FALSE;
    }

    $verify = openssl_verify($data, $signature, $publicKeyId, OPENSSL_ALGO_SHA256);
    
    return ($verify == 1);
}


// Преобразуем данные в массив
$data = json_decode($content, TRUE); 

// Далее различные проверки.
// Например: совпадения магазина, суммы, номера заказа, статуса, нужных событий и т.д.

// Обновление статуса заказа

?>
```

В случае успешной проверки мы можем начать отгрузку товара и доставку его покупателю.

### 4.1. Сценарий возврата платежа

Сегодня были пробки, и курьер не успел доставить обед вовремя. Покупатель отказался и требует вернуть деньги. Конечно, это можно сделать вручную в деталях инвойса в личном кабинете.

Полученный при создании инвойса в 1 пункте ключ доступа к инвойсу [invoiceAccessToken](https://developer.rbk.money/api/#operation/createInvoiceAccessToken) мог уже истечь, поэтому советуем для авторизации этой операции использовать ваш API-ключ.

Для возврата захолдированных средств используется метод [cancelPayment](https://developer.rbk.money/api/#operation/cancelPayment). Код для этого может выглядеть следующим образом:

```php
<?php
$apiKey = "eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InU3cFpGVHh6QkEiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMudTdwWkVsZ1dreS5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy51N3BaRWxnV2t5OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.5kzCh5ykQNb9jAFGMN_S8i6ZKBzw8W4jrV6e9L2iD35cWoIaiAPb3pVGgIFow19rByqE1ZaOhupz8oglryvp_A";

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.rbk.money/v1/processing/invoices/u7o9gfIwPA/payments/1/cancel",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\n\"reason\": \"cancel\"\n}",
  CURLOPT_HTTPHEADER => prepare_headers($apiKey),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}

function prepare_headers($apiKey)
{
    $headers = [];
    $headers[] = 'X-Request-ID: ' . uniqid();
    $headers[] = 'Authorization: Bearer ' . $apiKey;
    $headers[] = 'Content-type: application/json; charset=utf-8';
    $headers[] = 'Accept: application/json';
    return $headers;
}
?>
```

Если мы все сделали правильно, платформа отменит платеж и разморозит деньги на счете плательщика.

### 4.2. Сценарий подтверждения платежа

В случае успешной доставки, когда мы понимаем, что сделка завершена, нет смысла ждать стандартных 3 суток для автоматического подтверждения платежа. Достаточно вызвать метод [capturePayment](https://developer.rbk.money/api/#operation/capturePayment) с подходом, аналогичным в п 4.1. и деньги окажутся на счете вашего магазина.


### Остались вопросы?

- Прочитайте [полную документацию](https://developer.rbk.money/api/) по нашим публичным API.
- Мы отвечаем на [вопросы](https://github.com/rbkmoney/docs/issues) и принимаем [предложения по изменениям](https://github.com/rbkmoney/docs/pulls) в нашем публичном репозитории этой документации на [Github](https://github.com/rbkmoney/docs).
- Адрес технической поддержки: support@rbkmoney.com
