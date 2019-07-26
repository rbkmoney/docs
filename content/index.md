# Добро пожаловать в RBKmoney!

Наша платежная платформа позволяет подключить на ваш веб-сайт прием платежей с пластиковых карт в интернете в виде готового плагина для Drupal, 1C-Bitrix и других, в виде готовой платежной формы в iframe, а также и с помощью собственной платёжной формы, использующей наши JS-библиотеки и публичные API.
С нами вы можете организовать прием платежей в интернете быстро и гибко так, как это нужно именно вам. Мы создаем продукт, который удобен не только для бизнеса, но и для разработчиков.

Для подключения онлайн-платежей ознакомьтесь с документацией из раздела [Payments](/docs/payments/overview/). Документация по электронным кошелькам RBKmoney доступна в разделе [Wallets](/docs/wallets/overview/).

## Онлайн-платежи - быстрый старт

- [Зарегистрируйтесь](https://dashboard.rbk.money/) на нашем сайте для того, чтобы получить возможность сразу же начать техническую интеграцию и провести платежи в уже созданном для вас тестовом магазине.
- Прочитайте [обзор](/docs/payments/overview) технической интеграции с платежной платформой `RBKmoney Payments`.
- Выберите решение, которое наиболее подходит для вас:
    + Вы не разработчик, используете готовые решения для продажи товаров и услуг в интернете и хотите быстро организовать прием платежей на вашем сайте? [Прочтите инструкцию по быстрой настройке платежных модулей](/docs/payments/cms-modules/bitrix).
    + Вы хотите минимизировать время подключения и затраты на разработку? Попробуйте наше [готовое решение по приему платежей](/docs/payments/checkout).
    + Вы хотите полностью управлять внешним видом и действиями плательщика прямо на вашем сайте? Реализуйте собственную платежную форму и [интегрируйтесь](/docs/payments/tokenizer) с платформой, использующей наше API для приема платежей.

## Платежная форма Checkout

Для оплаты можно указать реквизиты одной из [тестовых карт](/docs/payments/refs/testcards). Например:

    Card number: 4242 4242 4242 4242
    Exp date: 12/20
    CVC: 123

<button class="live-demo-button">Оплатить</button>

Вы можете разместить следующий фрагмент кода у себя на сайте и провести тестовый платеж:
```html
<script src="https://checkout.rbk.money/checkout.js" class="rbkmoney-checkout"
    data-invoice-template-id="sUFLuTavi4"
    data-invoice-template-access-token="eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InNVRkx2eEhPcjIiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMuc1VGTHVUYXZpNC5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy5zVUZMdVRhdmk0OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.23zeJum41PbKd4_p4xg4v7ITNZDjeI72hK3cI5_MbZ8czforsPCYca8yiC9v5dfLeAiKKXxE8Ks-_HowY1EeWA"
    data-name="Company name"
    data-description="Some product"
    data-label="Pay with RBKmoney">
</script>
```
Более подробную информацию вы можете найти в разделе интеграции [checkout](/docs/payments/checkout).

## Нужна помощь?

- Прочитайте [полную документацию](https://developer.rbk.money/api/) по нашим публичным API.
- Мы отвечаем на [вопросы](https://github.com/rbkmoney/docs/issues) и принимаем [предложения по изменениям](https://github.com/rbkmoney/docs/pulls) в нашем публичном репозитории этой документации на [Github](https://github.com/rbkmoney/docs).
