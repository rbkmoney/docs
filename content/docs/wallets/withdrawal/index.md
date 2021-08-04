---
title: Вывод средств 

search: true

metatitle: wallet

metadescription: withdrawal

category: wallet

---

# Вывод средств {#withdrawal}

Данная статья описывает сценарий и детали вывода денежных средств с баланса [электронного кошелька RBK.money](../../wallets/overview).

## Требования {#mustHave}

Для того чтобы операция вывода [ЭДС](../../wallets/overview) завершилась успешно, должны быть соблюдены следующие условия:

* сумма [ЭДС](../../wallets/overview) на балансе [кошелька](../../wallets/creation) должна быть больше или равна сумме операции с учетом вознаграждения/комиссии RBK.money, если таковые имеются согласно условиям соответствующего договора;
* создан [приемник](../../wallets/overview/#destination) денежных средств с необходимым значением `resource`→ `type`;
* получено [право](../../wallets/overview/#withdrawal) на вывод средств (в случае, когда инициатор операции не является владельцем [кошелька](../../wallets/overview/#wallet) или [приемника](../../wallets/overview/#destination)).
* см. ‎«‎Обзор» → [«‎Валюта»](../../wallets/overview/#currency).

## Сценарии реализации {#cases}

Вывести денежные средства с баланса кошелька можно с помощью прямого обращения к [REST API](https://rbkmoney.github.io/wallets-api/v0/). Ниже представлен один из сценариев такого взаимодействия с [платформой](https://developer.rbk.money/docs/payments/overview/#_1): отражает успешный вывод [ЭДС](../../overview) на банковскую карту в случае, когда требуется предварительно создать [приемник](../../overview/#destination) средств.

<object data="img/withdrawal.svg"> </object>