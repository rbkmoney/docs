# Добро пожаловать в RBKmoney!

Наша платежная платформа позволяет подключить на ваш веб-сайт прием платежей с пластиковых карт в интернете в виде готового плагина для Drupal, 1C-Bitrix и других, в виде готовой платежной формы в iframe, а также и с помощью кастомной платёжной формы, использующей наши JS-библиотеки и публичные API.
С нами вы можете организовать прием платежей в интернете быстро и гибко так, как это нужно именно вам. Мы создаем продукт, который удобен не только для бизнеса, но и для разработчиков.

## Быстрый старт

- [Зарегистрируйтесь](https://dashboard.rbk.money/) на нашем сайте для того, чтобы получить возможность сразу же начать техническую интеграцию и провести платежи в уже созданном для вас тестовом магазине.
- Прочитайте [обзор](/integrations/overview) технической интеграции с платформой.
- Выберите решение, которое наиболее подходит для вас:
    + Вы не разработчик, используете готовые решения для продажи товаров и услуг в интернете и хотите быстро организовать прием платежей на вашем сайте? [Прочтите инструкцию по быстрой настройке платежных модулей](#).
    + Вы хотите минимизировать время подключения и затраты на разработку? Попробуйте наше [готовое решение по приему платежей](/integrations/checkout).
    + Вы хотите полностью управлять внешним видом и действиями плательщика прямо на вашем сайте? Реализуйте собственную кастомную форму и [интегрируйтесь](/integrations/tokenizer) с платформой, использующей наше API для приема платежей.

## Вы можете посмотреть как работает наша платежная форма

Для оплаты можно указать реквизиты одной из [тестовых карт](/refs/testcards). Например:

    Card number: 4242 4242 4242 4242
    Exp date: 12/20
    CVC: 123

<section id="live-demo">
    <form id="invoice-form">
        <h3>Конфигурация товара</h2>
        <div class="form-row">
            <label>Наименование:</label>
            <input type="text" id="product" maxlength="30" value="Резиновая уточка" />
        </div>
        <div class="form-row">
            <label>Описание:</label>
            <input type="text" id="description" maxlength="50" value="Очень нужная вещь" />
        </div>
        <div class="form-row">
            <label>Стоимость:</label>
            <input type="number" id="amount" min="1" max="40000" value="1499" />
        </div>
        <button class="live-demo-button">Создать invoice</button>
    </form>
    <div id="checkout-container" style="display: none">
        <h3 class="order">Создан инвойс</h2>
        <div class="product">Товар:&nbsp;</div>
        <div class="description">Описание:&nbsp;</div>
        <div class="amount">Сумма к оплате:&nbsp;</div>
        <button class="live-demo-button">Оплатить</button>
    </div>
    <div id="fountainG" style="display: none">
        <div id="fountainG_1" class="fountainG"></div>
        <div id="fountainG_2" class="fountainG"></div>
        <div id="fountainG_3" class="fountainG"></div>
        <div id="fountainG_4" class="fountainG"></div>
        <div id="fountainG_5" class="fountainG"></div>
        <div id="fountainG_6" class="fountainG"></div>
        <div id="fountainG_7" class="fountainG"></div>
        <div id="fountainG_8" class="fountainG"></div>
    </div>
</section>

## Нужна помощь?

- Прочитайте [полную документацию](https://rbkmoney.github.io/api/) по нашим публичным API.
- Мы отвечаем на [вопросы](https://github.com/rbkmoney/docs/issues) и принимаем [предложения по изменениям](https://github.com/rbkmoney/docs/pulls) в нашем публичном репозитории этой документации на [Github](https://github.com/rbkmoney/docs).
