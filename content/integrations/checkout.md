Платежная форма Checkout предоставляет собой готовое техническое решение, которое позволяет совершить платеж. Форма отдается с веб-серверов RBKmoney и открывается в iFrame таким образом, чтобы создать для плательщика видимость нахождения на сайте мерчанта.

## Пример кода инициализации платежной формы

```html
<script src="https://checkout.rbk.money/payframe/payframe.js" class="rbkmoney-checkout"
        data-invoice-id="string"
        data-access-token="string"
        data-endpoint-success="https://<your-server-side>"
        data-endpoint-success-method="GET"
        data-endpoint-failed="https://<your-server-side>"
        data-endpoint-failed-method="POST"
        data-name="Company name"
        data-amount="7,700"
        data-currency="Р"
        data-logo="https://checkout.rbk.money/checkout/images/logo.png">
</script>
```

| data-* атрибут           | Описание                                              | Обязательный | Возможные значения           |
| :----------------------: | ----------------------------------------------------- | :-----------:| :---------------------------:|
| invoice id               | Идентификатор инвойса                                 | ✓            | string                       |
| access token             | Токен для доступа к указанному инвойсу                | ✓            | string                       |
| endpoint success         | URL для отправки запроса в случае успешного платежа   |              | `https://<your-server-side>` |
| endpoint success method  | Тип Http метода для endpoint success                  |              | GET, POST (по умолчанию)     |
| endpoint failed          | URL для отправки запроса в случае неуспешного платежа |              | `https://<your-server-side>` |
| endpoint failed method   | Тип Http метода для endpoint failed                   |              | GET, POST (по умолчанию)     |
| name                     | Метка для задания именования формы                    |              | string                       |
| access amount            | Метка для вывода стоимости платежа                    |              | string                       |
| access currency          | Метка для вывода валюты                               |              | string                       |
| access logo              | URL для задания логотипа                              |              | `https://<your-server-side>` |

Примечание. Запросы на endpoint success, endpoint failed отправляются с `"Content-Type": "x-form-urlencoded"`.
