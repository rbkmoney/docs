---
title: Пополнение кошелька 

search: true

metatitle: pay

metadescription: deposit

category: pay

---

# Пополнение баланса кошелька {#deposit}

Данная статья описывает сценарий и детали пополнения баланса [электронного кошелька RBK.money](../../overview).

## Сценарии реализации {#cases}

Пополнить баланс [кошелька](../../overview/#wallet) можно следующими способами:

* с помощью [ЛК](https://developer.rbk.money/docs/payments/overview/#lk).
* настроив регулярные пополнения по расписанию;
* инициировав операцию разово путем обращения к курирующему менеджеру RBK.money;

### Пополнение с помощью ЛК {#lkDeposit}

[ЛК](https://developer.rbk.money/docs/payments/overview/#lk) позволяет пополнить баланс [кошелька](../../overview/#wallet) cо счета [магазина](https://developer.rbk.money/docs/payments/overview/#shop). Инструкция для пополнения описана в [данном](https://help.rbkmoney.com/lk/lk/#out) руководстве пользователя.

### Пополнение по расписанию {#sheduleDeposit}

Платформа позволяет настроить регулярное пополнение [кошелька](../../overview/#wallet) cо счета [магазина](https://developer.rbk.money/docs/payments/overview/#shop) по заданному расписанию. Для этого необходимо обратиться к курирующему вас менеджеру RBK.Money.

### Разовое пополнение (обращение в RBK.Money) {#ссDeposit}

Разовое пополнение можно произвести:

* cо счета [магазина](https://developer.rbk.money/docs/payments/overview/#shop) (в случае, когда используется [платежный сервис](https://rbkmoney.github.io/docs/docs/payments/overview.html) RBK.Money);
* с банковского счета (в случае, когда используется только [сервис электронных кошельков](../../overview)).

Для этого необходимо обратиться к курирующему вас менеджеру RBK.Money.

### Требования и ограничения

* Обязательным условием для проведения пополнения со счета [магазина](https://developer.rbk.money/docs/payments/overview/#shop) является наличие привязки [кошелька](../../overview/#wallet) к данному магазину.
Для привязки следует обратиться к курирующему вас менеджеру RBK.money.
* Валюта операции пополнения и [валюта пополняемого кошелька](https://rbkmoney.github.io/wallets-api/v0/#operation/createWallet) не должны отличаться от рублей.

## Поиск операций {#search}

Созданные пополнения, а также корректирующие их операции или отмены, можно получить с помощью вызова [данных](https://rbkmoney.github.io/wallets-api/v0/#tag/Deposits) методов API.
