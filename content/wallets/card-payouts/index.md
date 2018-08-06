Продукт вывода денег на карты, часто называемый как "массовые выплаты" предоставляет, собой пополнение баланса получателя в международных платежных системах. В терминологии VISA этот метод называется `Original Credit Transaction`. Наша платформа позволяет выполнить OCT-транзакцию через платформу кошельков `RBKmoney Wallets`.

Данный сервис предоставляется юридическим лицам, подписавшим с нами договор, создавших корпоративное электронное средство платежа, или **КЭСП**. Таким образом, КЭСП - это полностью идентифицированный кошелек юридического лица, имеющий соответствующие лимиты.

С точки зрения технической интеграции с платформой КЭСП ничем не отличается от пользовательского кошелька, поэтому мы настоятельно рекомендуем ознакомиться со статьей [работа с кошельками](/wallets/usage/). 

## Описание подходов

### Алгоритм вывода

- создать один экземпляр [личности](/wallets/overview/#_3);
- создать один [кошелек](/wallets/overview/#_5);
- привязывать необходимое количество [методов вывода средств](/wallets/overview/#_8);
- по мере необходимости вывода средств вызывать соответствующий [метод](/wallets/overview/#_11).

!!!note
	Для тестовой среды вы можете самостоятельно создавать все сущности и запускать процессы идентификации, запускать выплаты. Для перехода в боевой режим вам необходимо создать личность и предоставить ее идентификатор нам для проведения процесса ручной идентификации КЭСП.

### Подходы к реализации

Поскольку владельцем КЭСП являетесь вы и это единственный кошелек, который участвует в процессе все действия можно производить на вашем бекэнде. Также, отсутствует необходимость в создании [прав на управление ресурсами](/wallets/usage/#_1), поскольку действие может быть авторизовано вашим API-ключом.

!!!note
	На момент написания статьи, реализации [RBKmoney Wallet Utils](/wallets/usage/#rbkmoney-wallet-utils) для КЭСП не предоставляется. Формы ввода карточных данных для привязки карты, в случае необходимости создания таковых, должны быть реализованы на вашей стороне.


## Техническая реализация

### Создание личности

- единоразово создаем себе личность. Пример запроса:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/identities \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533563176' \
  -d '{
  "name": "Megacorp inc.",
  "provider": "test",
  "class": "person"
}'
```

- пример ответа платформы:

```json
{
  "class": "person",
  "createdAt": "2018-08-06T13:46:42.234281Z",
  "id": "1",
  "isBlocked": false,
  "level": "anonymous",
  "name": "Megacorp inc.",
  "provider": "test"
}
```

- опционально для боевого доступа предоставляем идентификатор личности (как правило он будет равен `1`) и проходим процесс идентификации.

### Создание кошелька

- единоразово создаем себе кошелек. Пример запроса:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/wallets \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533563283' \
  -d '{
  "name": "Megacorp payouts wallet",
  "identity": "1",
  "currency": "RUB"
}'
```

- пример ответа платформы:

```json
{
  "createdAt": "2018-08-06T13:48:09.076234Z",
  "currency": "RUB",
  "id": "1",
  "identity": "1",
  "isBlocked": false,
  "name": "Megacorp payouts wallet"
}
```

### Привязка карт

#### Токенизация карты

- передаем карточные данные в метод токенизации и получаем карточный токен:

```bash
curl -X POST \
  https://api.rbk.money/payres/v0/bank-cards \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533563501' \
  -d '{
  "type": "BankCard",
  "cardNumber": "4242424242424242",
  "expDate": "12/21",
  "cardHolder": "KEYN FAWKES",
  "cvv": "321"
}'
```

- пример ответа платформы:

```json
{
  "authData": "5ZAuwcI6zqZUJDtqOq1P4Y",
  "bin": "424242",
  "lastDigits": "4242",
  "paymentSystem": "visa",
  "token": "eyJiaW4iOiI0MjQyNDIiLCJsYXN0RGlnaXRzIjoiNDI0MiIsInBheW1lbnRTeXN0ZW0iOiJ2aXNhIiwidG9rZW4iOiI2UVN5SzBPYndhdjUxNVF4U0N4WDV4In0"
}
```

#### Привязка карты к личности

- привязываем полученный карточный токен к личности:


```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/destinations \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533563723' \
  -d '{
	"name": "Customer #1234567890",
	"identity": "3",
    "currency": "RUB",
	"resource": {
    	"type": "BankCardDestinationResource",
    	"token": "eyJiaW4iOiI0MTUwMzkiLCJsYXN0RGlnaXRzIjoiMDkwMCIsInBheW1lbnRTeXN0ZW0iOiJ2aXNhIiwidG9rZW4iOiI1TXlURjVha0VRWmVEMVZLS2JpNVluIn0"
	},
	"metadata": {
    	"display_name": "Card #4242"
	}
}'
```

- пример ответа платформы:

```json
{
  "createdAt": "2018-08-06T13:55:28.824975Z",
  "currency": "RUB",
  "id": "22",
  "identity": "3",
  "isBlocked": false,
  "metadata": {
    "display_name": "Card #4242"
  },
  "name": "Customer #1234567890",
  "resource": {
    "bin": "415039",
    "lastDigits": "0900",
    "paymentSystem": "visa",
    "token": "5MyTF5akEQZeD1VKKbi5Yn",
    "type": "BankCardDestinationResource"
  },
  "status": "Unauthorized"
}
```

#### Проверка статуса привязки

- по идентификатору привязки, возвращенному из предыдущего запроса, проверяем статус привязки опросом событий, либо подписываемся на соответствующий вебхук. Пример с опросом событий:

```bash
curl -X GET \
  https://api.rbk.money/wallet/v0/destinations/1 \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: 1533563815' \
  -H 'X-Request-ID: 1533563815'
```

- пример ответа платформы:

```json
{
  "createdAt": "2018-08-06T13:55:28.824975Z",
  "currency": "RUB",
  "id": "22",
  "identity": "3",
  "isBlocked": false,
  "metadata": {
    "display_name": "Card #4242"
  },
  "name": "Customer #1234567890",
  "resource": {
    "bin": "415039",
    "lastDigits": "0900",
    "paymentSystem": "visa",
    "token": "5MyTF5akEQZeD1VKKbi5Yn",
    "type": "BankCardDestinationResource"
  },
  "status": "Authorized"
}
```

- после перехода привязки в статус "авторизована", `"status": "Authorized"`, процесс привязки завершен. В будущем для создания выводов достаточно будет передать идентификатор кошелька с которого осуществляется вывод и идентификатор привязки.

### Выплата на карту

Запускаем процесс выплаты на карту. Пример запроса:

```bash
curl -X POST \
  https://api.rbk.money/wallet/v0/withdrawals \
  -H 'Authorization: Bearer {YOUR_API_KEY}' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json; charset=utf-8' \
  -H 'X-Request-ID: 1533564191' \
  -d '{
	"wallet": "18",
	"destination": "22",
	"body": {
    	"amount": 10000,
    	"currency": "RUB"
	}
}'
```

- пример ответа платформы:

```json
{
  "body": {
    "amount": 10000,
    "currency": "RUB"
  },
  "createdAt": "2018-08-06T14:03:16.137075Z",
  "destination": "22",
  "id": "11",
  "status": "Pending",
  "wallet": "18"
}
```

- по идентификатору выплаты, возвращенному из предыдущего запроса, проверяем статус привязки опросом событий, либо подписываемся на вебхук. Пример с опросом событий:

```bash
curl -X GET \
  https://api.rbk.money/wallet/v0/withdrawals/12 \
  -H 'Authorization: Bearer {YOUR_API_KEY}'
```

После перехода выплаты в состояние `Succeeded` выплату можно считать успешно завершенной.

### Массовые выплаты

Для массовых выплат вызываем методы выплат на карту в массовом объеме.
