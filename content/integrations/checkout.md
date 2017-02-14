Платежная форма Checkout предоставляет собой готовое техническое решение, использующее HTML, CSS и наши JS-библиотеки, которое позволяет сделать рендер платежной формы для ввода данных карт в веб-браузере плательщика. Форма отдается с веб-серверов RBKmoney и открывается в iFrame таким образом, чтобы создать для плательщика внешнюю видимость нахождения на сайте мерчанта.
Checkout валидирует и отправляет на нашу серверную часть карточные данные плательщика, а наша библиотека tokenizer.js в ответ возвращает токен платежного средства, который используется для создания транзакций на стороне вашего серверного кода.

## Пример кода инициализации платежной формы

```html
<script src="https://checkout.rbk.money/payframe/payframe.js" class="rbkmoney-checkout"
        data-key="<your_tokenizer_key>"
        data-invoice-id="e213ed1"
        data-order-id="1"
        data-amount="7,700"
        data-currency="Р"
        data-logo="https://<your-server-side>/logo.png"
        data-button-color="rgb(39, 136, 181)"
        data-name="Company name"
        data-endpoint-init="https://<your-server-side>/init_endpoint"
        data-endpoint-events="https://<your-server-side>/events_endpoint"
        data-endpoint-success="https://<your-server-side>/success_endpoint"
        data-endpoint-failed="https://<your-server-side>/failed_endpoint">
</script>
```
``data-key`` - ключ для токенизации карточных данных

``data-invoice-id`` - номер инвойса

``data-order-id`` - номер вашего заказа

``data-amount`` - поле для вывода в платежной форме стоимости заказа

``data-currency`` - для вывода в платежной форме типа валюты

``data-logo`` - путь к логотипу, который будет отображаться в платежной форме

``data-button-color`` - цвет кнопки для вызова платежной формы

``data-name`` - название компании, которое будет отображаться в платежной форме

``data-endpoint-init`` - url на который форма отправит POST запрос с данными для инициализации платежа. Форма ожидает ответ
со статусом 200, который воспримет как успешный запуск платежа с вашей стороны. Далее форма начнет отправлять запросы для получения событий платежа.

Пример запроса:
```js
{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: {
        invoiceId: <invoiceId>,
        token: <token>,
        session: <token session>,
        contractInfo: {
            email: <payer email>
        }
    }
}
```

``data-endpoint-events`` - url на который форма будет отправлять GET запросы для получения событий платежа. Ответы ожидаются в соответствии с протоколом нашего [API](https://rbkmoney.github.io/api/#operation/getInvoiceEvents). Фактически вам необходимо спроксировать запрос формы к нашему API.

Пример запроса:
```js
{
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    params: {
        invoiceId: <invoiceId>,
        orderId: <orderId>
    }
}
```

``data-endpoint-success``, ``data-endpoint-failed`` - url's на которые придут запросы, обработав которые вы можете настроить поведение в случае успешного или неуспешного платежа.
Пример запроса:
```js
{
    method: 'POST',
    headers: {
        'Content-Type': 'x-form-urlencoded'
    }
}
```
