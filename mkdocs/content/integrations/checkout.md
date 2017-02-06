Платежная форма Checkout предоставляет собой готовое техническое решение, использующее HTML, CSS и наши JS-библиотеки, которое позволяет отрисовать платежную форму для ввода данных карт в веб-браузете плательщика. Форма отдается с веб-серверов RBKmoney и открывается в iFrame таким образом, чтобы создать для плательщика внешнюю видимость нахождения на сайте мерчанта.
Checkout валидирует и отправляет на наши сервера карточные данные плательщика, а наша библиотека tokenizer.js в ответ возвращает токен платежного средства, который используется для создания транзакций на стороне вашего бекэнда.

## Пример кода инициализации платежной формы

```html
<script src="http://{host}:{port}/payframe/payframe.js" class="rbkmoney-checkout"
        data-key="your_public_key"
        data-invoice-id="e213ed1"
        data-order-id="1"
        data-endpoint-init="http://{host}:{port}/init_endpoint"
        data-endpoint-events="http://{host}:{port}/events_endpoint"
        data-endpoint-success="http://{host}:{port}/success_endpoint"
        data-endpoint-failed="http://{host}:{port}/failed_endpoint"
        data-amount="7,700"
        data-currency="Р"
        data-logo="http://{host}:{port}/logo.png"
        data-button-color="rgb(39, 136, 181)"
        data-name="Company name">
</script>
```

```
    data-key - публичный ключ для токенизации карточных данных
    data-invoice-id - номер инвойса
    data-order-id - номер вашего заказа
    data-endpoint-init - инициализация платежа
    data-endpoint-events - страница получения статуса инвойса, платежа
    data-endpoint-success и data-endpoint-failed - страницы для отправки запроса в случае успеха или неуспеха
    data-amount - поле для вывода в платежной форме стоимости заказа
    data-currency - для вывода в платежной форме типа валюты
    data-logo - путь к логотипу, который будет отображаться в платежной форме
    data-button-color - цвет кнопки для вызова платежной формы
    data-name - название компании, которое будет отображаться в платежной форме
```

После чего необходимо реализовать серверную часть для инициализации платежа, получения статусов заказа и обработку запросов в случае успеха и неуспеха.

## Пример PHP-кода реализации серверной части

### Создание инвойса на стороне платформы
```php
<?php

    date_default_timezone_set('UTC');
    $data = [
        'shopID' => 'your shop id',
        'amount' => $amount,
        'context' => [
            "order_id" => $order_id,
        ],
        'dueDate' => date("Y-m-d\TH:i:s\Z", strtotime("+1 days")),
        'currency' => $currency,
        'product' => $product,
        'description' => $description,
    ];

    $headers = [];
    $headers[] = 'X-Request-ID: ' . uniqid();
    $headers[] = 'Authorization: Bearer ' . $private_token;
    $headers[] = 'Content-type: application/json; charset=utf-8';
    $headers[] = 'Accept: application/json';

    $url = 'https://{host}:{port}' .   '/processing/invoices';
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    // Возвращает номер инвойса. Example: {"id":"2Dbs4d4Dw"}
    $response = curl_exec($curl);\

?>
```

### Запуск платежа в созданном инвойсе
```php
<?php

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID');

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $headers = [];
    $headers[] = 'X-Request-ID: ' . uniqid();
    $headers[] = 'Authorization: Bearer ' . $private_token;
    $headers[] = 'Content-type: application/json; charset=utf-8';
    $headers[] = 'Accept: application/json';

    $body = file_get_contents('php://input');
    $request = json_decode($body, true);

    $url = 'https://{host}:{port}' . "/processing/invoices/" . $request['invoiceId'] . '/payments';
    $data = [
        'paymentToolToken' => $request['token'],
        'paymentSession' => $request['session'],
        'contactInfo' => [
            'email' => $request['contractInfo']['email'],
        ]
    ];

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_POST, 1);
    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($curl);

    $response['http_code'] = $info['http_code'];
    $response['body'] = $body;

    curl_close($curl);
    /**
     * Необходимо вернуть в заголовке код http_code и вывести тело сообщения
     * Например:
     * http_response_code($response['http_code']);
     * return $response['body'];
     */
    return $response;

?>
```

### Запрос событий инвойса

```php
<?php

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID');



    $headers = [];
    $headers[] = 'X-Request-ID: ' . uniqid();
    $headers[] = 'Authorization: Bearer ' . $private_token;

    $prepareQueryParams = [];
    $prepareQueryParams['limit'] = (!empty($_GET['limit'])) ? $_GET['limit'] : 100000;
    $prepareQueryParams['eventID'] = $_GET['eventID'];

    $url = https://{host}:{port} . '/processing/invoices/' . $_GET['invoiceId'] . "/events?" . http_build_query($prepareQueryParams);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($curl);

    $response['http_code'] = $info['http_code'];
    $response['body'] = $body;

    curl_close($curl);
    /**
     * Необходимо вернуть в заголовке код http_code и вывести тело сообщения
     * Например:
     * http_response_code($response['http_code']);
     * return $response['body'];
     */
    return $response;

?>
```

### Обработчик callback-уведомлений

```php
<?php

    /**
     * Example:
     * {"invoice_id":"2Dbs4d4Dw","amount":120000,"currency":"RUB","created_at":"2011-07-01T09:00:00Z","metadata":{"type":null,"data":"eyJvcmRlcl9pZCI6Im15X29yZGVyX2lkIn0=","setType":false,"setData":true},"status":"paid"}
     ** /
    // Какие-то проверки на вашей стороне и обновление статуса
    $body = file_get_contents('php://input');
    $data = json_decode($body, TRUE);
    $signature = base64_decode($_SERVER['HTTP_X_SIGNATURE'])
    $pKeyId = openssl_get_publickey($publicKey);
    $verify = openssl_verify($body, $signature, $pKeyId, OPENSSL_ALGO_SHA256);
    if($verify) { 
       // some code
    } else {
       // some code
    }

?>
```

Последней и завершающей частью является реализация обработчика для обновления статуса вашего заказа по номеру инвойса.