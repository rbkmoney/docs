Библиотека **tokenizer.js** предоставляет вам возможность создания кастомных платежных форм, находящихся непосредственно на вашем веб-сервере, однако требует более сложной технической реализации.

# Пример интеграции кастомной платежной формы

Во-первых, мы сделаем несколько изменений в форме оплаты. Давайте в качестве примера возьмем урезанную форму, не использующую tokenizer.js:

```html
<form id="payment-form">
     <input id="card-number"/>
     <input id="card-holder"/>
     <input id="exp-date"/>
     <input id="cvv"/>
     <button id="pay-button" type="button">Pay</button>
 </form>

```

Нам нужно преобразовать эту форму, таким образом, чтобы она больше не использовала карточные данные на вашем сервере. Для этого подключаем tokenizer.js на странице и изменяем атрибуты, чтобы предотвратить передачу конфиденциальных карточных данных на ваш сервер.
Теперь образец нашей формы выглядит следующим образом:

```html
<head>
  <script type="text/javascript" src="https://js.rbk.money/v2/tokenizer.js"></script>
</head>

<body>
  <form id="payment-form">
       <input id="card-number"/>
       <input id="card-holder"/>
       <input id="exp-date"/>
       <input id="cvv"/>
       <button id="pay-button" type="button">Pay</button>
   </form>
   </body>
```

Теперь мы просто добавим еще немного кода между ```<head></head>```, чтобы попросить tokenizer.js отправить карточные данные и получить обратно карточный токен

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tokenization sample</title>
    <script src="https://code.jquery.com/jquery-3.1.0.slim.min.js"   integrity="sha256-cRpWjoSOw5KcyIOaZNo4i6fZ9tKPhYYb6i5T9RSVJG8=" crossorigin="anonymous"></script>

<script type="application/javascript" src="https://js.rbk.money/v2/tokenizer.js"></script>

    <script>
        $(function () {
            $('#pay-button').click(function () {
        Tokenizer.setPublicKey('Your Public Key');
                Tokenizer.card.createToken({
                    "paymentToolType": "cardData",
                    "cardHolder": $('#card-holder').val(),
                    "cardNumber": $('#card-number').val(),
                    "expDate": $('#exp-date').val(),
                    "cvv": $('#cvv').val()
                }, function (token) {

        //Token here
                }, function (error) {
        //Error here
                });
            });
        });
    </script>
</head>
<body>
```

```html
<form>
<input id="card-holder" placeholder="card holder">
<input id="card-number" placeholder="card number">
<input id="exp-date" placeholder="exp date">
<input id="cvv" placeholder="cvv">
<button id="pay-button" type="button">Pay</button>
</form>
```

В примере кода, вам необходимо будет установить публичный ключ полученный в личном кабинете, который позволяет токенизировать карточные данные или ожидает ошибку в ответ для отображения на платежной форме