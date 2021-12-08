# Overview

You can manage your payments using your [personal account](https://help.rbkmoney.com/lk/lk/) and/or by addressing the [RBK.money Platform API](https://developer.rbk.money/api/).
Payment acceptance methods are described in step 2 of ["Where do I start?"](https://developer.rbk.money/index.html#_2) section of the welcome page.

The description of the main terms and notions which the Platform operates is given below.

!!! note "The Platform"
    RBK.money software-hardware appliance providing technical realization of payment acceptance business-processes.

## Personal account {#lk}

To start working with the platform you need to [create](https://help.rbkmoney.com/lk/lk/#reg) and [sign in](https://help.rbkmoney.com/lk/lk/#preparation) to merchant [personal account](https://rbk.money/back-office/) (hereinafter - PA).

!!! note "Merchant"
   The seller of a product or service paid for by a buyer. Participant of information-technical and financial interaction.

In your PA section you can find the [API Key](https://help.rbkmoney.com/lk/lk/#apiKey) required for [authentication](#api) when addressing the Platform API, and make a [test payment](https://help.rbkmoney.com/lk/lk/#testManagement).
## API {#api}

One of the ways to receive payments online is to integrate with [RBK.money Platform API](https://developer.rbk.money/api/).

In order to successfully authorize a request to the [API](https://developer.rbk.money/api) an appropriate key should be passed in its header.  Different keys may be required for each individual request depending on the type of operation performed.

For example, the [API-Key](https://developer.rbk.money/api/#section/Authentication) is passed in [invoice](#invoice) creation [request](https://developer.rbk.money/api/#operation/createInvoice), and the [invoice access key](#invoiceAccessToken) — is passed in subsequent [requests](#payScheme), aimed at paying the invoice.

## Shop {#shop}

A shop is a merchant's point of sale. Represents a way of summarizing goods or services combined by a single category (MCC, Merchant Category Code). It is the recipient of the payment.

Any shop corresponds to at least one [account](https://developer.rbk.money/api/#operation/getAccountByID) in the platform on which the funds received from buyers are accumulated.

!!! note "Payer"
    An individual who pays for goods or services. In some cases, referred to as a "buyer".

Accumulated funds can be received by bank transfer or by adding funds to merchant's [RBK.money e-wallet](https://developer.rbk.money/docs/wallets/overview/).

A Shop can be:

* active or [inactive](https://help.rbkmoney.com/lk/lk/#holdShop);
* real or [test](https://help.rbkmoney.com/lk/lk/#testManagement).

To get information about the shop and/or manage its activity use the following [API queries](https://developer.rbk.money/api/#tag/Shops).

## Invoice {#invoice}

An invoice is a bill: a display of an order with goods or services to be paid. It demonstrates the obligations of the seller and the buyer.

You can create an invoice or get its status using [these](https://developer.rbk.money/api/#tag/Invoices) api queries.
A [createInvoice](https://developer.rbk.money/api/#operation/createInvoice) request results in pending payment invoice ussue in the platform, which is assigned a unique identifier and [access key](#invoiceAccessToken).

The life cycle of the payment invoice is described in [this](https://help.rbkmoney.com/lk/lk/#invoiceLifeCycle) section of the manual, as well as in the  ["Invoice States and Statuses"](https://developer.rbk.money/api/#section/Sostoyaniya-i-statusy-invojsa) section of the API documentation.

### Invoice Access Key {#invoiceAccessToken}

The key (InvoiceAccessToken) allows you to authorize a limited number of transactions required to make payments on a specified [invoice](#invoice).

InvoiceAccessToken, unlike the [API Key](https://developer.rbk.money/api/#section/Authentication), can be disclosed and published.

## Payment {#pay}

In order for the funds for goods and services offered to the payer be added to merchant's [accont](#shop), the [invoice](#invoice) must be paid for.

In case the payment is made via [RBK.money payment form (checkout)](../checkout), the sequence of interactions with the platform looks as follows: 

* invoke [createInvoice](https://developer.rbk.money/api/#operation/createInvoice) method;
* [встроить](../checkout) the payment form in buyer's browser.

The [payment form](../checkout) performs the entire payment process itself.

In case you create the payment form yourself, the sequence of interactions with the Platform looks as shown in ["The Scheme of information interaction"](#payScheme) section.

The life cycle of the payment is described in this [user guide](https://help.rbkmoney.com/lk/lk/#payLifeCycle).

### The Scheme of information interaction {#payScheme}

An example of [invoice](#invoice) payment performed from merchant's website via mercant created payform is given below.

The query names presented in the scheme indicate the specific methods of the payment [API](https://developer.rbk.money/api/).

<a href="/docs/payments/wsd/payScheme.png" data-lightbox="payScheme.png" data-title="payScheme.png"><img src="/docs/payments/wsd/payScheme.png"></a>

!!! note "Information"
    Receiving, transmitting, processing and storing bank card data entails the need to meet certain [security standards](https://ru.pcisecuritystandards.org/minisite/env2/).

## Event notification (Webhook)

In order to track the status of invoices and payments the set up of notifications (webhook/callback) is required.

Webhooks can be managed through [these](https://developer.rbk.money/api/#tag/Webhooks) API requests.

When you receive a notification, you need to make sure it was sent by the Platform. To accomplish this, the platform authenticates the information transmitted by signing messages with a private RSA key. A description of the "Webhooks Events API" specification can be found [here](https://developer.rbk.money/api/webhooks).
