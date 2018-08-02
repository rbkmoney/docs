В статье описаны основные функции кошелька `RBKmoney Wallet` для физических лиц - регистрация и авторизация в системе `RBKmoney Auth`, идентификация кошелька, привязка карты и вывод средств на нее.

Предположим, что мы, как мерчант, оказываем услуги клиентам-плательщикам. Плательщики заводят личный счет в нашей системе и хотят выводить с этого счета деньги на свою привязанную к кошельку карту. Поскольку вывод средств осущетсвляется с кошелька физического лица, мы, как мерчант должны получить право на управления ресурсами этого кошелька.

Мы только что начали использование сервисов RBKmoney и не имеем никаких кошельков, клиентов и карт, но хотим провести первую выплату. Для этого нужно произвести техническую интеграцию. 

## Регистрация и получение прав

<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="usage.js"></script>

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
  "resource": "developer.rbk.money",
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
	OpenID Connect подразумевает предварительную регистрацию клиента и на стороне RBKmoney и указание Redirect URL ваших сайтов, на которые будет разрешен возврат клиентов после авторизации в `RBKmoney Auth`. После регистрации вам будет выдан файл `keycloak.json` с боевыми настройками. Для получения боевого доступа [обратитесь](mailto:support@rbk.money) к нам.

	Для тестовой среды используйте клиента `developer.rbk.money` из примера выше.

	Валидные адреса для переадресации клиента: **`http://localhost:8000/*`**, **`http://127.0.0.1:8000/*`**. Настройте свой веб-сервер на эти адреса в вашей тестовой среде.


Теперь мы можем разместить у себя в личном кабинете кнопку, при нажатии на которую наш клиент сможет зарегистрировать или авторизовать свою учетную запись в `RBKmoney Auth`.

Эта документация интерактивная. Нажмите на кнопку и зарегистрируйтесь, или авторизуйтесь в сервисе, для получения полного объема информации, предоставляемого в статье.

<button id="login-user-button" class="wallet-utils-button">Войти в RBKmoney</button>

После успешной авторизации мы получили JWT, который позволит нам выполнить все необходимые действия в `Wallet API` от имени пользователя. 

## Создание личности и идентификация

Теперь, когда мы имеем права [пользователя](/wallets/overview/#_2), мы можем создать ему [личность](/wallets/overview/#_3) и запустить процесс идентификации.

Для решения проблем, связанных с соответствием требований законов о хранении и обработке персональных данных мы предоставляем не только сервис хранения персональных данных `RBKmoney Private Storage`, но и библиотеку, реализующую пользовательский интерфейс.

Для подключения библиотеки включаем ее в код нашей страницы:

```html
<script src="https://wallet.rbk.money/wallet-utils.js"></script>
```
<script src="https://wallet.rbk.money/wallet-utils.js"></script>

Для запуска непосредственно процесса идентификации нам нужно узнать идентификатор личности. Предположим, что пользователь новый и у него нет личности. Создадим ее асинхронно, воспользовавшись JWT, полученным в предыдущей главе:

```js
function createIdentity() {
    const apiEndpoint = 'https://api.rbk.money/wallet/v0/identities';
    const walletProviderId = 'test';

    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var data = JSON.parse(this.responseText);
            resolve(data);
        };
        xhr.onerror = reject;
        xhr.open('POST', apiEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + AuthService.getAccountInfo().token);
        xhr.setRequestHeader('X-Request-ID', guid());
        xhr.send(JSON.stringify({
            name: AuthService.getAccountInfo().profileName,
            provider: walletProviderId,
            class: 'person',
            metadata: {
                lkDisplayName: 'Иванов Иван Иванович'
            }
        }));
    });
}
```

дальше достаточно вызвать функцию `startIdentityChallenge()` из `Wallet Utils` и передать в нее полученный при создании идентификатор личности:

```js
walletUtils.startIdentityChallenge({
    identityID: '<string>'
});
```

Теперь мы можем создать обработчик, который при нажатии на кнопку создает личность, получает ее идентификатор и запускает процесс идентификации Wallet Utils с отображением формы ввода паспортных данных и СНИЛС.

Нажмите на кнопку и введите тестовые данные.

<button id="start-identity-button" class="wallet-utils-button">Пройти идентификацию</button>

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

Теперь, когда у нас создана личность и опционально пройдена идентификация, мы можем привязать к личности карту. Для этого необходимо вызвать функцию `createOutput()` из `Wallet Utils` и передать в нее идентификатор личности и название карты для вывода:


```js
walletUtils.createOutput({
    identityID: identityID,
    name: "Payout #" + identityID
});
```

Теперь мы можем создать обработчик, который при нажатии на кнопку запрашивает карточные данные, привязывает их к личности и создает [метод вывода средств](/wallets/overview/#_8).

<button id="create-payout-button" class="wallet-utils-button">Привязать карту</button>

## Серверная часть

На этом браузерную часть можно считать завершенной. Пример реализации, обеспечивающего работу интерактивных кнопок вы можете посмотреть в исходном коде скрипта [usage.js](usage.js).

Любым удобным способом передаем себе на бекенд JWT клиента, с ним мы будем обращаться к `Wallet API`, а также идентификаторы личности и метода вывода средств, полученных выше.

## Создание кошелька

Теперь у нас достаточно данных для того, чтобы со своего бекенда создать кошелек, получить права на [управление кошельком](/wallets/overview/#_7) и [методом вывода](/wallets/overview/#_10) и запустить процесс [выплаты на карту](/wallets/overview/#_11).

- вызываем метод `createWallet()`:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/wallets \
  -H 'Authorization: Bearer {JWT}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533232362' \
  -d '{
	"name": "Friendly name",
	"identity": "{IDENTITY_ID}",
	"currency": "RUB",
	"metadata": {
    	"client_locale": "RU_ru"
	}
}'
```

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

в дальнейшем нам понадобится его идентификатор.

## Право управления кошельком и методом вывода

- создаем право на управление кошельком:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/wallets/{WALLET_ID}/grants \
  -H 'Authorization: Bearer {JWT}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533232490' \
  -d '{
  "asset": {
    "amount": 10000,
    "currency": "RUB"
  },
  "validUntil": "2019-07-07T11:04:09Z"
}'
```

- в ответ нам возвращается структура:

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

- создаем право на управление методом вывода средств:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/destinations/{DESTINATION_ID}/grants \
  -H 'Authorization: Bearer {JWT}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533232632' \
  -d '{
	"validUntil": "2019-07-07T11:04:09Z"
}'
```

- в ответ нам возвращается структура:

```json
{
    "token": "eyJtZXRhZGF0YSI6e30sInJlc291cmNlSUQiOiIxIiwicmVzb3VyY2VUeXBlIjoiZGVzdGluYXRpb25zIiwidmFsaWRVbnRpbCI6IjIwMTktMDctMDdUMTE6MDQ6MDlaIn0",
    "validUntil": "2019-07-07T11:04:09Z"
}
```

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
