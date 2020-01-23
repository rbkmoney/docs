В статье описаны основные функции кошелька `RBKmoney Wallet` для физических лиц - регистрация и авторизация в системе `RBKmoney Auth`, идентификация кошелька, привязка карты и вывод средств на нее.

!!!note
    Обратите внимание! Данный раздел документации описывает примеры использования возможностей **пользовательских кошельков**. Продукт, наиболее известный как **массовые выплаты**, либо выплаты на карты, либо выплаты с КЭСП, **описан в разделе "Массовые выплаты на карты"**.

Предположим, что мы оказываем услуги клиентам-плательщикам. Плательщики заводят личный счет в нашей системе и хотят выводить с этого счета деньги на свою привязанную к кошельку карту. Поскольку вывод средств осуществляется с кошелька физического лица, мы должны получить право на управления ресурсами этого кошелька.

Мы только что начали использование сервисов RBKmoney и не имеем никаких кошельков, клиентов и карт, но хотим провести первую выплату. Для этого нужно произвести техническую интеграцию. 

## Регистрация и получение прав

<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="usage.js"></script>
<link rel="stylesheet" href="usage.css">

Право на управление кошельком от имени пользователя нужно запросить у него явным образом. Данная возможность реализована в виде стандартного [OAuth2 Flow](https://en.wikipedia.org/wiki/OAuth#OAuth_2.0) по протоколу [OpenID Connect](https://en.wikipedia.org/wiki/OpenID_Connect). Протокол подразумевает обязательное взаимодействие с плательщиком через браузер. 

Плательщик должен иметь учетную запись в `RBKmoney Auth` и предоставить право на управление ресурсами принадлежащего ему кошелька вам. Фактически, это означает, что нам нужно запросить и получить в ответ [JSON Web Token](https://jwt.io/), который использовать в виде ключа авторизации в `RBKmoney API` для того, чтобы выполнять запросы от имени нашего клиента.

Мы предоставляем библиотеку, реализующую большинство функций и позволяющую получить токен. Для подключения библиотеки достаточно включить ее в код вашей страницы: 

```html
<script src="https://auth.rbk.money/auth/js/keycloak.js"></script>
```
<script src="https://auth.rbk.money/auth/js/keycloak.js"></script>
- создать файл конфигурации и разместить его на своем сервисе, например под именем `keycloak.json`:

```json
{
  "realm": "external",
  "auth-server-url": "https://auth.rbk.money/auth",
  "ssl-required": "none",
  "resource": "test-dummy",
  "public-client": true
}
```

- вызвать метод инициализации библиотеки авторизации и функцию `login()`:

```js
const auth = new Keycloak('keycloak.json');
return new Promise(function(resolve, reject) {
    auth.init().success(function() {
        resolve();
    }).error(function() {
        return reject();
    });
});

auth.login();
```

!!!note
    Внимание!
    OpenID Connect подразумевает предварительную регистрацию клиента на стороне RBKmoney и указание Redirect URL ваших сайтов, на которые будет разрешен возврат клиентов после авторизации в `RBKmoney Auth`. После регистрации вам будет выдан файл `keycloak.json` с боевыми настройками. Для получения боевого доступа [обратитесь](mailto:support@rbk.money) к нам.

    Для тестовой среды используйте клиента `test-dummy` из примера выше.

    Валидные адреса для переадресации клиента: **`http://localhost:8000/*`**, **`http://127.0.0.1:8000/*`**. Настройте свой веб-сервер на эти адреса в вашей тестовой среде.


Теперь мы можем разместить у себя в личном кабинете кнопку, при нажатии на которую наш клиент сможет зарегистрировать или авторизовать свою учетную запись в `RBKmoney Auth`.

Эта документация интерактивная. Нажмите на кнопку и зарегистрируйтесь, или авторизуйтесь в сервисе, для получения полного объема информации, предоставляемого в статье. Большинство функций записывают свои действия в консоли браузера, вы можете использовать их для отладки.

<button id="login-user-button" class="wallet-utils-button">Войти в RBKmoney</button>

После успешной авторизации мы получили JWT, который позволит нам выполнить все необходимые действия в `Wallet API` от имени пользователя.

## Создание личности

Теперь, когда мы имеем права [пользователя](/docs/wallets/overview/#_2), мы можем создать ему [личность](/docs/wallets/overview/#_3) и запустить процесс идентификации.

!!!note
    Обратите внимание! JWT, которые вы получаете через Oauth2 Flow, имеют очень короткое время жизни - минуты. Это сделано для безопасности. Нецелесообразно передавать клиентский JWT себе на бекэнд для работы с `Wallets API`. Мы рекомендуем все действия - создание личности, кошелька и получение прав на управление и вывод создавать на фронтенде, после чего передавать токены прав себе на бекэнд и использовать их для создания выплат. Срок жизни прав управления вы устанавливаете сами.

<button id="create-identity-button" class="wallet-utils-button">Создать личность</button>

- в ответ нам возвращается структура, подобная:

```json
{
  "class": "person",
  "createdAt": "2018-08-06T11:48:01.183346Z",
  "id": "1",
  "isBlocked": false,
  "level": "anonymous",
  "metadata": {
    "lkDisplayName": "Иванов Иван Иванович"
  },
  "name": "test test",
  "provider": "test"
}
```

В дальнейшем нам для создания метода вывода и кошелька понадобится идентификатор созданной личности, запомним его.

Пример функции создания личности может выглядеть так:

```js
function createIdentity() {
    const walletProviderId = 'test';
    const {token, profileName} = AuthService.getAccountInfo();
    const params = {
        name: profileName,
        provider: walletProviderId,
        class: 'person',
        metadata: {
            lkDisplayName: 'Иванов Иван Иванович'
        }
    };
    return post('https://api.rbk.money/wallet/v0/identities', token, params);
}
```

## RBKmoney Wallet Utils

Для решения проблем, связанных с соответствием требований законов о хранении и обработке карточных и персональных данных мы предоставляем JS-библиотеку, реализующую пользовательский интерфейсы ввода паспортных и карточных данных.

Для подключения библиотеки включаем ее в код нашей страницы:

```html
<script src="https://wallet.rbk.money/wallet-utils.js"></script>
```
<script src="https://wallet.rbk.money/wallet-utils.js"></script>

## Запуск процесса идентификации

Для запуска непосредственно процесса идентификации нам достаточно вызвать функцию `startIdentityChallenge()` из `Wallet Utils` и передать в нее полученный при создании идентификатор личности:

```js
walletUtils.startIdentityChallenge({
    identityID: '<string>'
});
```

Нажмите на кнопку и введите тестовые данные.

<button id="create-identity-challenge-button" class="wallet-utils-button">Запустить идентификацию</button>

Библиотека самостоятельно завершит процесс идентификации и вернет события успеха или ошибки, которые вы можете обработать:

```js
walletUtils.onCompleteIdentityChallenge = (event) => {
    // handle user complete identity challenge
};

walletUtils.onFailIdentityChallenge = (event) => {
    // handle user failed identity challenge
};
```

## Привязка карты

Теперь, когда у нас создана личность и опционально пройдена идентификация, мы можем привязать к личности карту. Для этого необходимо вызвать функцию `createDestination()` из `Wallet Utils` и передать в нее идентификатор личности и название карты для вывода:


```js
walletUtils.createDestination({
    identityID: identityID,
    name: "Visa 4242 42** **** **** 4242"
});
```

### Привязать карту

Теперь мы можем создать обработчик, который при нажатии на кнопку запрашивает карточные данные, привязывает их к личности и создает [метод вывода средств](/docs/wallets/overview/#_8).

<button id="create-payout-button" class="wallet-utils-button">Привязать карту</button>

### Создать право управления привязкой

После создания метода вывода нам нужно получить [право управления методом вывода](/docs/wallets/overview/#_10), или `destination grant`.

<button id="create-destination-grant-button" class="wallet-utils-button">Создать право управления методом вывода</button>

- в ответ нам возвращается структура, подобная:

```json
{
    "token": "eyJtZXRhZGF0YSI6e30sInJlc291cmNlSUQiOiIxIiwicmVzb3VyY2VUeXBlIjoiZGVzdGluYXRpb25zIiwidmFsaWRVbnRpbCI6IjIwMTktMDctMDdUMTE6MDQ6MDlaIn0",
    "validUntil": "2019-07-07T11:04:09Z"
}
```
Пока запомним ее, мы к ней вернемся, и перейдем к созданию кошелька и получению права управления им.

!!!note
    Скрипт, встроенный в документацию также логгирует данные в консоль браузера, вы можете просмотреть структуру ответа для вашей учетной записи.

Пример функции создания прав на метод вывода может выглядеть так:

```js
function createDestinationGrant(destinationID, validUntil) {
    const {token} = AuthService.getAccountInfo();
    const params = {
        validUntil: validUntil
    };
    return post(`https://api.rbk.money/wallet/v0/destinations/${destinationID}/grants`, token, params);
}
```

## Создание кошелька

Теперь у нас достаточно данных для того, чтобы создать кошелек, получить право на [управление кошельком](/docs/wallets/overview/#_7) и передать данные себе на бекэнд, где запустить процесс [выплаты на карту](/docs/wallets/overview/#_11).

### Создать кошелек

<button id="create-wallet-button" class="wallet-utils-button">Создать кошелек</button>

- в ответ нам возвращается структура о созданном кошельке:

```json
{
    "createdAt": "2018-07-30T13:17:18.111543Z",
    "currency": "RUB",
    "id": "3",
    "identity": "2",
    "isBlocked": false,
    "metadata": {
        "client_locale": "RU_ru"
    },
    "name": "Friendly name"
}
```

Пример функции создания кошелька может выглядеть так:

```js
function createWallet(identityID) {
    const {token} = AuthService.getAccountInfo();
    const params = {
        name: 'Default wallet',
        identity: identityID,
        currency: 'RUB',
        metadata: {
            client_locale: 'RU_ru'
        }
    };
    return post('https://api.rbk.money/wallet/v0/wallets', token, params);
}
```

в дальнейшем нам понадобится его идентификатор.

### Право управления кошельком

- создаем право на управление кошельком:

<button id="create-wallet-grant-button" class="wallet-utils-button">Создать право управления кошельком</button>

- в ответ нам возвращается структура, подобная:

```json
{
    "asset": {
        "amount": 10000,
        "currency": "RUB"
    },
    "token": "eyJtZXRhZGF0YSI6eyJhc3NldCI6eyJhbW91bnQiOjEwMDAwLCJjdXJyZW5jeSI6IlJVQiJ9fSwicmVzb3VyY2VJRCI6IjMiLCJyZXNvdXJjZVR5cGUiOiJ3YWxsZXRzIiwidmFsaWRVbnRpbCI6IjIwMTktMDctMDdUMTE6MDQ6MDlaIn0",
    "validUntil": "2019-07-07T11:04:09Z"
}
```

## Серверная часть

На этом браузерную часть можно считать завершенной. Пример реализации, обеспечивающего работу интерактивных кнопок вы можете посмотреть в исходном коде скрипта [usage.js](usage.js).

Любым удобным способом передаем себе на бекэнд:

  - `destinationID`, или идентификатор метода вывода средств;
    - `destination grant`, или структуру права управления методом вывода;
  - `walletID`, или идентификатор кошелька;
    - `wallet grant`, или структуру права управления кошельком.

## Вывод средств на карту

У нас достаточно данных для того, чтобы запустить процесс вывода денег на карту. Вызываем метод `createWithdrawal()`:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/withdrawals \
  -H 'Authorization: Bearer {JWT}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533232823' \
  -d '{
  "wallet": "{WALLET_ID}",
  "destination": "{DESTINATION_ID}",
  "body": {
      "amount": 1430000,
      "currency": "RUB"
  },
  "metadata": {
      "notify_email": "iliketrains@example.com"
  },
  "walletGrant": "{WALLET_GRANT}",
  "destinationGrant": "{DESTINATION_GRANT}"
}'
```

- выплата запущена. Получить ее состояние можно вызвав

```bash
curl -X GET \
  https://api.rbk.money/wallet/v0/withdrawals/{WITHDRAWAL_ID} \
  -H 'Authorization: Bearer {JWT}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: 1533233124' \
  -H 'X-Request-ID: 1533233124'
```
