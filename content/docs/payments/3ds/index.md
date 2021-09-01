---
title: 3D-Secure 

search: true

metatitle: pay

metadescription: 3D-Secure payments

category: pay

---

# 3D-Secure

3D-Secure (Three-Domain Secure) — протокол аутентификации [покупателей](https://developer.rbk.money/docs/payments/overview/#shop), обеспечивающий безопасную оплату товаров и услуг в интернете. Технология 3D-Secure (далее по тексту — 3DS) подразумевает дополнительный шаг аутентификации при совершении покупки в интернет-магазине:

* на первом шаге на странице оплаты используются реквизиты банковской карты: номер, срок действия, имя держателя, код проверки подлинности (например, CVC2);
* на втором — дополнительный защитный код, который вводится на веб-форме банка-эмитента.

Данная статья предназначена для компаний, осуществляющих приём платежей с помощью собственной платёжной формы и взаимодействия с [платформой](https://developer.rbk.money/docs/payments/overview/#_1) RBK.money по [API](https://developer.rbk.money/api/).

!!! note "Обязательность 3DS-аутентификации"
    По умолчанию все платежи, проводимые RBK.money, требуют использования 3DS. Для уточнения возможности отключения 3DS (использования не-3DS терминала) обратитесь в службу поддержки. Однако в некоторых случаях при проведении платежей через не-3DS терминал банк-эмитент всё же может потребовать аутентификацию: ваше приложение должно поддерживать использование данной технологии.

## Сценарий {#cases}

Этап проведения платежа, на котором используется 3DS, отражён в [данном](https://developer.rbk.money/docs/payments/overview/#payScheme) сценарии.

Ниже представлена схема, описывающая детали прохождения [покупателем](https://developer.rbk.money/docs/payments/overview/#shop) 3DS.

<object data="../3ds/img/3ds.svg"> </object>

!!! note "Информация"
    В случае использования одной из [тестовых карт](/refs/testcards/) платформа эмулирует процесс прохождения 3DS-аутентификации.

**Описание**

* После выполнения [запроса](https://developer.rbk.money/api/#operation/createPayment) на оплату выставленного [счета](https://developer.rbk.money/docs/payments/overview/#invoice) необходимо запустить таймер и начать [опрашивать](https://developer.rbk.money/api/#operation/getInvoiceEvents) RBK.money на предмет появления новых событий.

    !!! note "Интервал и время опроса"
        Рекомендуется установить интервал опроса в 1 секунду и ограничение на время опроса в 60-120 секунд, либо 60-120 запросов.

* [Платформа](https://developer.rbk.money/docs/payments/overview/#_1) проверит необходимость использования 3DS и вернет нужные для этого данные в случае положительного результата: в ответе на [запрос событий по инвойсу](https://developer.rbk.money/api/#operation/getInvoiceEvents) появится изменение с `changeType` = `PaymentInteractionRequested` и `userInteraction.interactionType` = `Redirect`.

    Пример ответа платформы:

```json
   {
        "createdAt": "2018-03-20T10:15:26.905268Z",
        "id": 3,
        "changes": [
            {
                "changeType": "PaymentInteractionRequested",
                "paymentID": "1",
                "userInteraction": {
                    "interactionType": "Redirect",
                    "request": {
                        "requestType": "BrowserPostRequest",
                        "uriTemplate": "https://3ds-mock.rbkmoney.com/mpi/acs",
                        "form": [
                            {
                                "key": "TermUrl",
                                "template": "https://wrapper.rbk.money"
                            },
                            {
                                "key": "PaReq",
                                "template": "paReq"
                            },
                            {
                                "key": "MD",
                                "template": "COM_MPI-ymJorPXs5A1"
                            }
                        ],
                    }
                }
            }
        ],
    }
```

* Полученную в `request` структуру следует использовать для переадресации браузера покупателя на страницу банка-эмитента по указанному в ответе `uriTemplate`.

    !!! note "Переадресация на страницу 3DS-аутентификации"
        * Тип переадресации `request` → `requestType` (GET или POST) зависит от решения банка-эквайера. Следует поддерживать оба варианта. 
        * Значение параметра `uriTemplate` не подлежит изменению.
        * Набор параметров в `form` для `requestType:POST` может меняться: его возвращает соответствующая международная платежная система (далее по тексту —  МПС). Не следует базировать на нём логику работы приложения: например, проверять наличие определённого параметра или присутствие его значения. Количество параметров и их значения при выполнении переадресации должны оставаться неизменны.

    Пример запроса:

```json 
    curl "https://3ds-mock.rbkmoney.com/mpi/acs" --data "TermUrl=https://wrapper.rbk.money?PaReq=paReq&MD=COM_MPICOM_MPI-ymJorPXs5A1"
```

* Покупатель воспользуется вторым фактором аутентификации на странице банка-эмитента.
* Банк-эмитент сформирует ответ об успешности прохождения аутентификации и оповестит об этом [платформу](https://developer.rbk.money/docs/payments/overview/#_1).

    !!! note "Успешное прохождение 3DS-аутентификации"
        Для того чтобы узнать об успешном прохождении [покупателем](https://developer.rbk.money/docs/payments/overview/#shop) 3DS-аутентификации, при выполнении [запроса](https://developer.rbk.money/api/#operation/createPayment) на оплату выставленного [счета](https://developer.rbk.money/docs/payments/overview/#invoice) необходимо передать `redirectUrl`: см. `payer` → `sessionInfo`.

RBK.money следует [опрашивать](https://developer.rbk.money/api/#operation/getInvoiceEvents) до тех пор, пока параметр `changeType` не примет значение `InvoiceStatusChanged`. Данное значение говорит о финальном статусе оплаты [инвойса](https://developer.rbk.money/docs/payments/overview/#invoice).
