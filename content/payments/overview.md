## Регистрация в личном кабинете

Перед началом работы с платформой вам будет необходимо пройти регистрацию в [личном кабинете мерчанта](https://dashboard.rbk.money/). 

!!! note "Мерчант (Merchant)"
    Участник технического и финансового взаимодействия, предоставляющий товары и услуги, выставляющий инвойсы и имеющий возможность вывести средства из системы.

!!! note "Платформа (Platform)"
    Программно-аппаратный комплекс RBKmoney, обеспечивающий техническую реализацию бизнес-процессов по приему платежей

## Магазины

Магазин – это способ обобщения товаров и услуг, объединённых одной категорией, которые вы продаете вашим клиентам. К конкретным магазинам привязаны ваши счета, на которых аккумулируются средства плательщиков, впоследствии перечисляемые вам с помощью банковских переводов или других средств вывода.

!!! note "Плательщик (Payer)"
    Физическое лицо, покупатель ваших товаров и услуг, который владеет платёжными средствами и участвует в процессах оплаты созданных вами инвойсов. Уникальным обязательным идентификатором плательщика в системе является его email.

Магазины могут быть тестовыми и активными. Тестовый магазин – магазин с тестовой категорией товаров или услуг, по которому разрешен запуск платежей только с использованием [тестовых банковских карт](/refs/testcards/), а также запрещены процессы вывода средств с помощью банковских переводов.

!!! note "Информация"
    Тестовые магазины используют ту же производственную среду, что и активные, поэтому их можно использовать для мониторинга доступности платформы.

Если вы зарегистрировались в личном кабинете, у вас уже есть ваш первый тестовый магазин.

## Инвойсы

Платформа использует инвойс, как отражение ваших обязательств в виде предлагаемых товаров или услуг, некий контейнер для запуска и обработки платежей. Перед встраиванием платежной формы в браузер плательщика, или попытками списать средства с его платежного инструмента на вашей серверной части, необходимо создать в платформе инвойс и получить его идентификатор.

!!! note "Платёж (Payment)"
    Процесс в рамках инвойса, в ходе которого средства плательщика поступают в вашу пользу в виде финансовых обязательств платформы. После того, как инвойс полностью оплачен, вы должны приступить к исполнению своих обязательств перед плательщиком, например, направить товар в службу доставки или оказать обещанную услугу.

В магазине, в рамках которого вы создаёте инвойсы, на ваше усмотрение вы можете включить доставку Webhook`ов, или асинхронных callback-уведомлений на указанный вами URL вашей серверной части. Платформа может отправлять подобные уведомления, чтобы как можно скорее уведомить о важных изменениях инвойса, например, по факту полной его оплаты.

## Прием платежей

В общем случае последовательность действий с платформой выглядит так:

- С помощью вызова метода createInvoice() нашего API вы создаете в платформе инвойс, который используется для дальнейшего списания средств, а также уникальный ключ доступа к инвойсу, который можно публиковать в HTML, отдаваемый UA.
- Вы встраиваете платежную форму в браузер плательщика, а именно:
    - открываете iframe с нашей платежной формой и передаете в него идентификатор инвойса и ключ доступа к нем, или
    - верстаете платежную форму самостоятельно и вызываете ее с ваших серверов с теми же параметрами.
- Платежная форма самостоятельно выполняет весь процесс платежа.
- При необходимости платформа может уведомлять вашу систему на настроенный вами адрес Webhook`а.

### Диаграмма последовательности взаимодействия

В качестве примера проведения успешной оплаты с использованием Webhook`ов можно рассмотреть следующую диаграмму:
<a href="../../payments/wsd/custom_form_w_cb.png" data-lightbox="custom_form_w_cb.png" data-title="custom_form_w_cb.png"><img src="../../payments/wsd/custom_form_w_cb.png"></a>

## Авторизация запросов

Для того, чтобы платформа могла авторизовать вызываемые вами методы нашего API, необходимо с каждым запросом передать соответствующий ключ. В зависимости от выполняемых операций вам могут понадобиться различные ключи.

### API-ключ

Ваш приватный ключ (_API Token_), используемый для авторизации вашей серверной части. Этот ключ используется для наиболее критичных действий, таких, как создание инвойса. Этот ключ должен быть доступен и известен только вам.

### Ключ для доступа к инвойсу

Ключ (_Invoice Access Token_), который позволяет получить доступ к инвойсу. С помощью этого ключа можно авторизовать ограниченное количество операций, необходимых для проведения платежей по указанному инвойсу.

Данный ключ использует платежная форма Checkout, и библиотека токенизации платежного инструмента плательщика Tokenizer. Вы можете публиковать этот ключ.

## Webhook`и и авторизация полученных через них данных

В обратной ситуации, в тех случаях, когда ваша серверная часть получает уведомления на указанный вами URL, вам необходимо убедиться, что уведомление действительно было отправлено платформой. Для решения этой задачи в платформа подтверждает подлинность присланной информации подписывая сообщения приватным ключом RSA. Описание спецификации Webhooks Events API находится [тут](https://developer.rbk.money/api/webhooks).
Самими Webhook`ами можно управлять как через личный кабинет, так и с помощью нашего публичного [API](https://developer.rbk.money/api/#Webhooks).

## Сценарии интеграции

- Вы хотите интегрировать готовую платежную форму Checkout, которая обеспечивает оркестрацию всего процесса платежа? Вам [сюда](/checkout).
- Вы хотите интегрировать вашу кастомную платежную форму с платформой? Тогда вам [сюда](/tokenizer).