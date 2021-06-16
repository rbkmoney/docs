---
title: Портал документации

search: true

metatitle: user manual lk 1.0.0

metadescription: Документация для разработчиков

language_tabs:
  - shell

category:  main

---

# Добро пожаловать на портал документации RBK.money!

RBK.money (далее по тексту — платформа) позволяет принимать платежи онлайн.

## Для кого и зачем создан портал?

Портал будет полезен, если:

* вы разработчик компании, использующей [продукты RBK.money](https://rbk.money);
* у вас есть необходимость выстраивать интеграцию с платформой c помощью API или использовать наши плагины/SDK для приема платежей;
* вам необходимо увидеть описание платежных API и иную техническую документацию.

## С чего начать?

**Шаг 1** 
Прочитайте [обзор](/docs/payments/overview) технической интеграции с платформой.

**Шаг 2**
Выберите подходящий способ приема платежей:

* нужны готовые решения для продажи товаров в интернете и быстрая организация приема платежей на сайте — ознакомьтесь с [инструкцией по настройке платежных модулей](/docs/payments/cms-modules/bitrix);
* необходимо минимизировать время на интеграцию и ресурсы на разработку — используйте [платежную форму RBK.money](/docs/payments/checkout);
* хотите полностью управлять внешним видом страницы оплаты и действиями покупателя на вашем сайте — реализуйте собственную платежную форму и используйте [одну из наших библиотек](/docs/payments/tokenizer), а также [платежный API](https://developer.rbk.money/api/);
* принимаете платежи в мобильном приложении — готовый SDK для [iOS](https://github.com/rbkmoney/payments-ios-sdk) или [Android](https://github.com/rbkmoney/payments-android-sdk) поможет вам в этом.

**Шаг 3**
Воспользуйтесь быстрым способом провести платеж: разместите представленный ниже код на сайте и проведите тестовую оплату с помощью нашей платежной формы.

```html
<script src="https://checkout.rbk.money/checkout.js" class="rbkmoney-checkout"
    data-invoice-template-id="sUFLuTavi4"
    data-invoice-template-access-token="eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InNVRkx2eEhPcjIiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMuc1VGTHVUYXZpNC5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy5zVUZMdVRhdmk0OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.23zeJum41PbKd4_p4xg4v7ITNZDjeI72hK3cI5_MbZ8czforsPCYca8yiC9v5dfLeAiKKXxE8Ks-_HowY1EeWA"
    data-name="Company name"
    data-description="Some product"
    data-label="Pay with RBKmoney">
</script>
```

При оплате можно указать реквизиты одной из [тестовых карт](/docs/payments/refs/testcards).

    Card number: 4242 4242 4242 4242
    Exp date: 12/20
    CVC: 123

<button class="live-demo-button">Оплатить</button>

Более подробную информацию вы можете найти в разделе  [Checkout](/docs/payments/checkout).

## Нужна помощь?

Ознакомьтесь с описанием разделов данного портала и, если у вас остались вопросы — мы [отвечаем на них](https://github.com/rbkmoney/docs/issues) и [принимаем предложения](https://github.com/rbkmoney/docs/pulls) по изменениям в нашем публичном репозитории на [Github](https://github.com/rbkmoney/docs).
