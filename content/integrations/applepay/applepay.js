var domainName = 'applefags.rbkmoney.com';
var merchantIdentifier = 'merchant.money.rbk.checkout';
var paymentAmount = 10;
var merchantValidationEndpoint = 'https://wrapper.rbk.money/applepay/api/v1/session';
var displayName = 'RBKmoney Apple Pay Test';

if (window.ApplePaySession) {
    var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    promise.then(function(canMakePayments) {
        if (!canMakePayments)
            document.getElementById("apple-pay-button").disabled = true;
    });
} else {
    document.getElementById("apple-pay-button").disabled = true;
}

document.getElementById("apple-pay-button").onclick = function(event) {
    var paymentRequest = {
        currencyCode: 'RUB',
        countryCode: 'RU',
        total: {
            label: displayName,
            amount: paymentAmount
        },
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['masterCard', 'visa']
    };

    var session = new ApplePaySession(3, paymentRequest);

    session.onvalidatemerchant = function(event) {
        var promise = validateMerchant(event.validationURL);
        promise.then(function(merchantSession) {
            session.completeMerchantValidation(merchantSession);
        });
    }

    function validateMerchant(validationURL) {
        return new Promise(function(resolve, reject) {
            var applePayPayload = {
                'merchantId': merchantIdentifier,
                'validationURL': validationURL,
                'body': {
                    'merchantIdentifier': merchantIdentifier,
                    'domainName': domainName,
                    'displayName': displayName
                }
            };

            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                var data = JSON.parse(this.responseText);
                resolve(data);
            };
            xhr.onerror = reject;
            xhr.open('POST', merchantValidationEndpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify(applePayPayload));
        });
    }

    session.onpaymentauthorized = function(event) {

        console.log(JSON.stringify(event.payment.token));
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
    }

    session.begin();
};