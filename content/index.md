---
title: Портал документации

search: true

metatitle: user manual lk 1.0.0

metadescription: Документация для разработчиков

language_tabs:
  - shell

category:  main

---

# Welcome to RBK.money developer documentation portal!

RBK.money (hereinafter - the platform) allows you to accept payments online.

## Who is this portal designed for?

The portal will be helpful if:

* you are one of the software developers in a company using  [RBK.money products](https://rbk.money);
* you need to perform integration with the platform via API or use our plugins/SDK to accept payments;
* you need to review payment API description and/or study other technical documentation.

## Where do I start?

**Step 1** 
Study the [overview](/docs/payments/overview) of the platform technical integration procedure.

**Step 2**
Choose convenient payment acceptance method:

* if you need an out-of-the-box solution for online sales and its rapid deployment to provide timely online payment acceptance - follow our payment modules setting up [guidelines](/docs/payments/cms-modules/bitrix);
* if you need to minimize time expenditure on integration procedure and resource cost on development - use RBK.money [checkout form](/docs/payments/checkout);
* if you want to thoroughly manage and customise payment page layout and buyers' actions on your website implement your own payment form using one of our [libraries](/docs/payments/tokenizer), and payment  [APIs](https://developer.rbk.money/api/);
* if you accept online payments in mobile apps - ready-made SDK for [iOS](https://github.com/rbkmoney/payments-ios-sdk) or [Android](https://github.com/rbkmoney/payments-android-sdk) will help you out.

**Step 3**
Use our quick solution to make your test payment: add the script below to your website and perform a test payment using our payment form:

```html
<script src="https://checkout.rbk.money/checkout.js" class="rbkmoney-checkout"
    data-invoice-template-id="sUFLuTavi4"
    data-invoice-template-access-token="eyJhbGciOiJFUzI1NiIsImtpZCI6IllKSWl0UWNNNll6TkgtT0pyS2s4VWdjdFBVMlBoLVFCLS1tLXJ5TWtrU3MiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImFudG9uLmx2YUBnbWFpbC5jb20iLCJleHAiOjAsImp0aSI6InNVRkx2eEhPcjIiLCJuYW1lIjoiQW50b24gS3VyYW5kYSIsInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBhcnR5LiouaW52b2ljZV90ZW1wbGF0ZXMuc1VGTHVUYXZpNC5pbnZvaWNlX3RlbXBsYXRlX2ludm9pY2VzOndyaXRlIiwicGFydHkuKi5pbnZvaWNlX3RlbXBsYXRlcy5zVUZMdVRhdmk0OnJlYWQiXX19LCJzdWIiOiJmNDI3MjNkMC0yMDIyLTRiNjYtOWY5Mi00NTQ5NzY5ZjFhOTIifQ.23zeJum41PbKd4_p4xg4v7ITNZDjeI72hK3cI5_MbZ8czforsPCYca8yiC9v5dfLeAiKKXxE8Ks-_HowY1EeWA"
    data-name="Company name"
    data-description="Some product"
    data-label="Pay with RBKmoney">
</script>
```

When paying, you may use the following [test card](/docs/payments/refs/testcards) information.

    Card number: 4242 4242 4242 4242
    Exp date: 12/20
    CVC: 123

<button class="live-demo-button">Checkout</button>

You can find more information in [Checkout](/docs/payments/checkout) section.

## Need help?

Read descriptions of the sections of this portal and, if you still have [questions](https://github.com/rbkmoney/docs/issues) or  [suggestions](https://github.com/rbkmoney/docs/pulls) for changes, we will gladly answer them in our public repository on [Github](https://github.com/rbkmoney/docs).
