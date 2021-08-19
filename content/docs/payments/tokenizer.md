---
title: Tokenizer

search: true

metatitle: pay

metadescription: Tokenizer library

category: pay

---

# Tokenizer

**Tokenizer.js** — библиотека, которая позволяет создать токен платежного средства с целью безопасного хранения и получения реквизитов для оплаты [инвойса](https://developer.rbk.money/docs/payments/overview/#invoice).

Сценарий, в котором используется **Tokenizer.js** описан в [данном](https://developer.rbk.money/docs/payments/overview/#payScheme) разделе.

**Руководство по использованию**

1. Подключите **Tokenizer.js** на свою страницу оплаты:

    ```html
    <script src="https://rbkmoney.st/tokenizer.js"></script>
    ```

2. Передайте ему [InvoiceAccessToken](https://developer.rbk.money/docs/payments/overview/#invoiceAccessToken):

    ```html
    <script type="text/javascript">
        Tokenizer.setAccessToken('<access_token>');
    </script>
    ```

3. Передайте **Tokenizer.js** реквизиты банковской карты, полученные на собственной платежной форме. Примите токен в ответ.

    ```html
    <script type="text/javascript">
        Tokenizer.card.createToken({
            paymentToolType: 'CardData',
            cardHolder: '<card holder>',
            cardNumber: '<card number>',
            expDate: '<exp date>',
            cvv: '<cvv>'
        }, (token) => {
            console.log(token); // { token: 'string', session: 'string' }
        }, (error) => {
            console.error(error); // { code: 'string', message: 'string' }
        });
    </script>
    ```

**Пример взаимодействия платежной формы с библиотекой**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tokenization sample</title>
    <script src="https://code.jquery.com/jquery-3.1.0.slim.min.js" integrity="sha256-cRpWjoSOw5KcyIOaZNo4i6fZ9tKPhYYb6i5T9RSVJG8=" crossorigin="anonymous"></script>
    <script src="https://rbkmoney.st/tokenizer.js"></script>
    <script>
        $(function () {
            $('#pay-button').click(function () {
                Tokenizer.setAccessToken('<access_token>');
                Tokenizer.card.createToken({
                    paymentToolType: "CardData",
                    cardHolder: $('#card-holder').val(),
                    cardNumber: $('#card-number').val(),
                    expDate: $('#exp-date').val(),
                    cvv: $('#cvv').val()
                }, (token) => {
                    console.log(token); // { token: 'string', session: 'string' }
                }, (error) => {
                    console.error(error); // { code: 'string', message: 'string' }
                });
            });
        });
    </script>
</head>
<body>
    <form>
        <input id="card-holder" placeholder="card holder">
        <input id="card-number" placeholder="card number">
        <input id="exp-date" placeholder="exp date">
        <input id="cvv" placeholder="cvv">
        <button id="pay-button" type="button">Pay</button>
    </form>
</body>
```
