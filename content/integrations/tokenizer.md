Библиотека **tokenizer.js** предоставляет вам возможность создания кастомных платежных форм, находящихся непосредственно на вашем веб-сервере, однако требует более сложной технической реализации.

## Пример интеграции кастомной платежной формы
* Подключите tokenizer.js на свою страницу:
```html
<script src="https://js.rbk.money/v2/tokenizer.js"></script>
```
* Установите ключ токенизации в tokenizer:
```html
<script type="text/javascript">
    Tokenizer.setPublicKey('<your_tokenizer_key>');
</script>
```
* Получите токен платежного средства, передав данные в tokenizer:
```html
<script type="text/javascript">
    Tokenizer.card.createToken({
        "paymentToolType": "cardData",
        "cardHolder": "<card_holder>",
        "cardNumber": "<card_number>",
        "expDate": "<exp_date>",
        "cvv": "<cvv>"
    }, function (token) {
        //token here
    }, function (error) {
        //error here
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
                Tokenizer.setPublicKey('<your_tokenizer_key>');
                Tokenizer.card.createToken({
                    "paymentToolType": "cardData",
                    "cardHolder": $('#card-holder').val(),
                    "cardNumber": $('#card-number').val(),
                    "expDate": $('#exp-date').val(),
                    "cvv": $('#cvv').val()
                }, function (token) {
                    //token here
                }, function (error) {
                    //error here
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
