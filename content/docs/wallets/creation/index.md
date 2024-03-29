---
title: Создание кошелька 

search: true

metatitle: wallet

metadescription: wallet creation

category: wallet

---

# Создание кошелька {#deposit}

Данная статья описывает сценарий создания [электронного кошелька RBK.money](../../wallets/overview).

Создать электронный [кошелек](../../wallets/overview/#wallet) можно с помощью прямого обращения к [REST API](https://rbkmoney.github.io/wallets-api/v0/). Ниже представлен сценарий такого взаимодействия с [платформой](https://developer.rbk.money/docs/payments/overview/#_1).

<object data="img/walletCreation.svg"> </object>

В данной таблице отражены константные значения некоторых параметров, которые требуется передать при обращении к API.

| Метод API | Параметр | Значение для тестирования | Значение для боевого использования
| ------------- |------------------ | ----- |----- |
| [Создание личности](https://rbkmoney.github.io/wallets-api/v0/#operation/createIdentity) |provider | test | dpl |
| [Создание личности](https://rbkmoney.github.io/wallets-api/v0/#operation/createIdentity) | class | person | company |