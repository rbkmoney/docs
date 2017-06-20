Платежная форма Checkout представляет собой готовое техническое решение, которое позволяет совершить платеж. Форма отдается с веб-серверов RBKmoney и открывается в iframe таким образом, чтобы создать для плательщика видимость нахождения на сайте мерчанта.

## Пример кода инициализации платежной формы

### Использование HTML API

```html
<form action="https://<your-server-side>" method="GET">
    <script src="https://checkout.rbk.money/checkout.js" class="rbkmoney-checkout"
            data-invoice-id="string"
            data-invoice-access-token="string"
            data-name="Company name"
            data-logo="https://checkout.rbk.money/images/logo.png"
            data-label="Pay with RBKmoney"
            data-description="Some product"
            data-pay-button-label="Pay">
    </script>
</form>
```

С помощью `form` можно задать callback. В случае успешного платежа, будет произведен submit формы.

| data-* атрибут           | Описание                                                             | Обязательный | Возможные значения                    |
| :----------------------: | -------------------------------------------------------------------- | :-----------:| :------------------------------------:|
| invoice id               | Идентификатор инвойса                                                | ✓            | oVU2LzUCbQ                            |
| invoice access token     | Токен для доступа к указанному инвойсу                               | ✓            | eyJhbGciOiJSUzI1N...                  |
| name                     | Наименование вашей компании или сайта                                |              | Company name                          |
| logo                     | URL для задания логотипа                                             |              | `https://<your-server-side>/logo.png` |
| label                    | Текст кнопки открытия формы                                          |              | Pay with RBKmoney                     |
| description              | Описание вашего продукта или сервиса                                 |              | Some product                          |
| pay button label         | Текст кнопки оплаты                                                  |              | Pay                                   |
| email                    | Если вы знаете email вашего плательщика, вы можете его предзаполнить |              | example@mail.com                      |

### Использование JS API

```html
<script src="https://checkout.rbk.money/checkout.js"></script>

<button id="customButton">Pay</button>

<script>
    const checkout = RbkmoneyCheckout.configure({
        invoiceID: 'string',
        invoiceAccessToken: 'string',
        name: 'Company name',
        logo: 'https://checkout.rbk.money/images/logo.png',
        description: 'Some product',
        payButtonLabel: 'Pay',
        opened: function () {
            console.log('Checkout opened');
        },
        closed: function () {
            console.log('Checkout closed');
        },
        finished: function () {
            console.log('Payment successful finished');
        }
    });
    
    document.getElementById('customButton').addEventListener('click', function () {
        checkout.open();
    });
    
    window.addEventListener('popstate', function () {
        checkout.close();
    });
</script>
```

| Свойство конфигурации    | Описание                                                             | Обязательное | Возможные значения                    |
| :----------------------: | -------------------------------------------------------------------- | :-----------:| :------------------------------------:|
| invoiceID                | Идентификатор инвойса                                                | ✓            | oVU2LzUCbQ                            |
| invoiceAccessToken       | Токен для доступа к указанному инвойсу                               | ✓            | eyJhbGciOiJSUzI1N...                  |
| name                     | Наименование вашей компании или сайта                                |              | Company name                          |
| logo                     | URL для задания логотипа                                             |              | `https://<your-server-side>/logo.png` |
| description              | Описание вашего продукта или сервиса                                 |              | Some product                          |
| payButtonLabel           | Текст кнопки оплаты                                                  |              | Pay                                   |
| email                    | Если вы знаете email вашего плательщика, вы можете его предзаполнить |              | example@mail.com                      |
| opened                   | Callback на открытие модального окна                                 |              | function                              |
| closed                   | Callback на закрытие модального окна                                 |              | function                              |
| finished                 | Callback на успешное завершение платежа                              |              | function                              |

Примечание: Checkout возвращает управление в callback только при успешном завершении платежа. С целью увеличения конверсии оплат при неуспешных попытках оплаты (например неверно введены данные или на карте недостаточно средств) мы оставляем UA плательщика на форме, позволяя исправить ошибку, использовать другую карту и т.п.