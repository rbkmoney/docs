Платежная форма Checkout предоставляет собой готовое техническое решение, использующее HTML, CSS и наши JS-библиотеки, которое позволяет отрендерить платежную форму для ввода данных карт в веб-браузере плательщика. Форма отдается с веб-серверов RBKmoney и открывается в iFrame таким образом, чтобы создать для плательщика внешнюю видимость нахождения на сайте мерчанта.
Checkout валидирует и отправляет на наши сервера карточные данные плательщика, а наша библиотека tokenizer.js в ответ возвращает токен платежного средства, который используется для создания транзакций на стороне вашего серверного кода.

## Пример кода инициализации платежной формы

```html
<script src="http://checkout.rbk.money/payframe/payframe.js" class="rbkmoney-checkout"
        data-key="your_public_key"
        data-invoice-id="e213ed1"
        data-order-id="1"
        data-endpoint-init="http://<your-server-side>/init_endpoint"
        data-endpoint-events="http://<your-server-side>/events_endpoint"
        data-endpoint-success="http://<your-server-side>/success_endpoint"
        data-endpoint-failed="http://<your-server-side>/failed_endpoint"
        data-amount="7,700"
        data-currency="Р"
        data-logo="http://<your-server-side>/logo.png"
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
```
    data-endpoint-init - url на который форма отправит POST запрос 
    с данными для инициализации платежа. В ответ ожидается ответ 
    со статусом 200, который форма воспринимает как успешный запуск платежа. 
    Пример запроса:
```
```json
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
```
data-endpoint-events - url на который форма будет 
отправлять GET запросы для получения событий платежа. 
Пример запроса:
```
```js

`<your url>?invoiceId=<your invoiceId>&orderId=<your orderId>`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}
```
```
data-endpoint-success и data-endpoint-failed - страницы для отправки запроса в случае успеха или неуспеха
url's на который придет POST запрос в случае успешного или неуспешного платежа.
Пример запроса:
```
```js
{
    method: 'POST',
    headers: {
        'Content-Type': 'x-form-urlencoded'
    }
}
```

После чего необходимо реализовать серверную часть для инициализации платежа, получения статусов заказа и обработку запросов в случае успеха и неуспеха.