# Hooker
<!-- Место для ваших шильдиков -->

<!-- Toc -->
## Содержание
- [Общее описание](#Общее-описание)
  - [Стратегия доставки webhook'ов](#Стратегия-доставки-webhook'ов)
  - [Авторизация полученных сообщений](#Авторизация-полученных-сообщений)
- [Сценарии работы сервиса](#Сценарии-работы-сервиса)
  - [Типы событий инвойса (InvoicesTopic)](#Типы-событий-инвойса-(InvoicesTopic))
  - [Типы событий плательщика (CustomersTopic)](#Типы-событий-плательщика-(CustomersTopic))
- [Связанные сервисы](#Cвязанные-сервисы)
- [Составители](#Составители)


## Общее описание

**Hooker (Webhooks Notifications and Management Service)** – сервис, определяющий протокол доставки асинхронных оповещений о возникновении новых событий в рамках организации, которые сервис доставляет в виде HTTP-запросов на URL-адреса  webhook'ов, указанных при их формировании. Информацию о произошедших событиях сервис получает из базы данных Kafka.  

**Webhook** - это подписка на определенный тип события либо их группу, касающихся различных объектов в рамках организации. Для управления webhook'ами используются методы RBKmoney API, описанные в спецификации [RBKmoney Webhooks Management API](https://rbkmoney.github.io/api/#tag/Webhooks). Когда наступает одно из событий в рамках определенного инвойса (например, изменение статуса инвойса или платежа по этому инвойсу), платформа выбирает webhook, подходящий под этот тип события, и отправляет HTTP-запрос, содержащий сообщение в формате [JSON](https://www.json.org/json-en.html) на указанный в этом webhook'е URL. Если создано несколько webhook'ов, подходящих под указанный тип события, то сообщение о возникновении события доставляется одновременно на все заданные в webhook'ах URL в неопределённом порядке. Максимальное количество webhook'ов для одного магазина - 10 штук.

### Стратегия доставки webhook'ов
Платформа гарантирует порядок доставки сообщений о произошедших событиях в рамках определенного инвойса, никакое событие не может быть пропущено и доставлено не в порядке возникновения в платформе. Платформа поддерживает очередь сообщений для каждого инвойса для того, чтобы соблюсти эти гарантии.

Запрос на доставку считается успешным только при получении ответа со статусом `200`. Платформа будет ожидать успешного ответа на отправленный запрос в течение 10 секунд. В случае ответа с любым другим статусом или по истечении указанного времени, отведённого на обработку оповещения, платформа будет пытаться повторно доставить оповещения до получения успешного ответа, либо до принятия решения о невозможности доставить информацию. Попытки доставки будут производиться со следующими временными интервалами между запросами:
- 30 секунд;
- 5 минут;
- 15 минут;
- 1 час;
- каждый час в течении суток (24 часа).

Если последняя попытка в течении суток доставить оповещение оканчивается неудачей, все события, которые накопились в очереди этого инвойса, отбрасываются.

### Авторизация полученных сообщений
Платформа подтверждает подлинность оповещений, подписывая сообщения приватным ключом, уникальным для каждого webhook'а, парный публичный ключ к которому содержится в данных этого webhook'а. Подпись передается в HTTP-заголовке Content-Signature. В заголовке в виде различных атрибутов содержится информация об использованном при формировании подписи алгоритме и значение подписи в формате [URL-safe base-64](https://tools.ietf.org/html/rfc4648). Пример подписи представлен ниже.

```
Content-Signature: alg=RS256; digest=zFuf7bRH4RHwyktaqHQwmX5rn3LfSb4dKo...
```

<!-- На данный момент возможно использование единственного алгоритма формирования подписи. -->

#### Алгоритм [RS256](https://tools.ietf.org/html/rfc7518#section-3.3)

Подпись формируется согласно алгоритму [RSASSA-PKCS1-v1_5](https://tools.ietf.org/html/rfc3447#section-8.2), на вход которому подаётся результат вычисления хэша сообщения по алгоритму [SHA-256](https://tools.ietf.org/html/rfc6234).


## Сценарии работы сервиса
Сервис Hooker может создавать webhook'и для двух типов событий:
1. типы событий инвойса (InvoicesTopic);
2. типы событий плательщиков (CustomersTopic).

### Типы событий инвойса (InvoicesTopic)
Подробное описание webhook'ов для типов событий инвойса описано на примере [кейса проведения платежа](https://github.com/volkov-sergei/coredocs/tree/master/docs/Readme/Hooker/Кейс обычного платежа.md).

### Типы событий плательщика (CustomersTopic)
Подробное описание webhook'ов для типов событий плательщика описано на примере [кейса создания рекуррента](https://github.com/volkov-sergei/coredocs/tree/master/docs/Readme/Hooker/Кейс создания рекуррента.md).

## Cвязанные сервисы
* `Hellgate`
* `Kafka cluster`   

## Составители