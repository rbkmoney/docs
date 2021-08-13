# Обзор {#overview}

Электронные кошельки RBK.money — сервис, позволяющий хранить электронные денежные средства (далее по тексту — ЭДС), пополнять их баланс и распоряжаться ими: переводить на банковскую карту, другой электронный кошелек и т.д.

Управлять ЭДС можно с помощью [RBK.money Wallet API](https://rbkmoney.github.io/wallets-api/v0/). Получать информацию об электронных кошельках (а также операциях с их использованием) можно как с помощью [API](https://rbkmoney.github.io/wallets-api/v0/), так и [личного кабинета](https://help.rbkmoney.com/lk/lk/#wallets). Для этого необходимо [зарегистрироваться в личном кабинете и получить API-ключ](https://developer.rbk.money/docs/payments/overview/#lk).

Ниже приведено описание основных терминов и понятий, которыми оперирует [платформа](https://developer.rbk.money/docs/payments/overview/#_1).

!!! note "Информация"
    Терминология, правила и ограничения сервиса реализованы с учетом требований Регуляторов отрасли (в частности, [Федерального закона от 27.06.2011 N 161-ФЗ](http://pravo.gov.ru/proxy/ips/?docbody=&nd=102148779)).

## Личность {#identity}

Цифровая личность (identity) — это [структура](https://rbkmoney.github.io/wallets-api/v0/#operation/createIdentity), описывающая личность [участника платформы](https://developer.rbk.money/api/#tag/Parties).

Более одной личности одновременно могут относиться к одному и тому же [участнику платформы](https://developer.rbk.money/api/#tag/Parties). Каждая личность может являться владельцем более одного электронного [кошелька](#wallet) и [приемника денежных средств](#destination).

## Кошелек {#wallet}

Электронный кошелек (wallet) — [сущность](https://rbkmoney.github.io/wallets-api/v0/#operation/createWallet), в рамках которой ведётся учёт баланса ЭДС.

### Основные сценарии использования {#cases}

* Пополнение баланса ЭДС со счета [магазина](https://developer.rbk.money/docs/payments/overview/#shop).
* [Вывод средств](https://rbkmoney.github.io/wallets-api/v0/#operation/createWithdrawal) одним из указанных в `resource`
→ `type` [способов](https://rbkmoney.github.io/wallets-api/v0/#operation/createDestination).

Подробнее со сценариями пополнения и вывода средств можно ознакомиться в соответствующих разделах данного портала.

### Валюта {#currency}

Валюта ЭДС определяется при [создании](https://rbkmoney.github.io/wallets-api/v0/#operation/createWallet) кошелька параметром `currency`.

!!! note "Информация"
    При выводе средств [валюта](https://rbkmoney.github.io/wallets-api/v0/#operation/createWallet) кошелька, [валюта](https://rbkmoney.github.io/wallets-api/v0/#operation/createWithdrawal) операции, и [валюта](https://rbkmoney.github.io/wallets-api/v0/#operation/createDestination) приемника средств должны совпадать.

### Управление операциями вывода ЭДС {#withdrawal}

Совершить операцию вывода ЭДС с баланса кошелька может:

* владелец кошелька;
* пользователь, получивший на это право.

!!! note "Пользователь"
    Учетная запись, которой соответствует уникальный [ключ](https://developer.rbk.money/docs/payments/overview/#lk) для доступа к функциональности [платформы](https://developer.rbk.money/docs/payments/overview/#_1) по API.

**Получение права на вывод средств**

Владельцу [кошелька](#wallet)/[приемника средств](#destination) необходимо выпустить токен, подтверждающий право на осуществление данной операции, и предоставить его другому пользователю. Пользователь в свою очередь должен передать полученное значение в параметре `walletGrant`/`destinationGrant` соответствующего [запроса](https://rbkmoney.github.io/wallets-api/v0/#operation/createWithdrawal).

Платформа оперирует двумя видами токенов:

* [walletGrant](https://rbkmoney.github.io/wallets-api/v0/#operation/issueWalletGrant) — позволяет вывести ЭДС с указанного электронного кошелька (walletID);
* [destinationGrant](https://rbkmoney.github.io/wallets-api/v0/#operation/issueDestinationGrant) — позволяет вывести ЭДС на указанный [приемник денежных средств](#destination) (destinationID).

Пользователь, получивший `walletGrant`, вправе вывести средства с баланса кошелька владельца,  выпустившего токен. Пользователь, получивший `destinationGrant` вправе вывести ЭДС с баланса своего кошелька на [приемник](#destinationн) денежных средств другого пользователя (владельца токена).

Каждый токен имеет строго ограниченный срок жизни, по истечении которого автоматически становится недействительными. Срок действия токена определяется параметром `validUntil` в соответствующем запросе на выдачу прав.

## Приемник денежных средств {#destination}

Приемник средств (destination) — сущность платформы, хранящая данные о назначении платежа при выводе денежных средств с баланса электронного [кошелька](#wallet).
Вид назначения (способ, которым можно вывести средства) определяется содержимым параметра `type` [запроса на создание приемника](https://rbkmoney.github.io/wallets-api/v0/#operation/createDestination) (см. список значений `resource`→ `type`).
