Библиотека **tokenizer.js** предоставляет вам возможность создания кастомных платежных форм, находящихся непосредственно на вашем веб-сервере, однако требует более сложной технической реализации.

## Пример интеграции кастомной платежной формы
* Подключите tokenizer.js на свою страницу:
```html
<script src="https://js.rbk.money/v2/tokenizer.js"></script>
```
* Установите access token в tokenizer:
```html
<script type="text/javascript">
    Tokenizer.setAccessToken('<access_token>');
</script>
```
* Получите токен платежного средства, передав данные в tokenizer:
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

Пример обработки формы c помощью tokenizer:
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
