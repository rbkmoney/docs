var $invoiceForm = $('#invoice-form');
var $checkoutContainer = $('#checkout-container');
var $loader = $('#fountainG');
var backendOriginUrl = 'https://live-demo-backend.rbkmoney.com';

$invoiceForm.children('.live-demo-button').click(function (e) {
    e.preventDefault();
    $invoiceForm.hide();
    $loader.show();
    initInvoice().then(function (invoice) {
        createAccessToken(invoice).then(function (accessToken) {
            $loader.hide();
            $checkoutContainer.show();
            initPayButton(invoice, accessToken.payload);
        });
    });
});

function initInvoice() {
    return $.ajax({
        url: backendOriginUrl + '/invoice/create',
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            shopID: 1,
            amount: Number($('#amount').val()) * 100 || 1000,
            currency: 'RUB',
            dueDate: moment().add(1, 'hour').utc().format(),
            product: $('#product').val(),
            description: $('#description').val(),
            metadata: {}
        })
    });
}

function createAccessToken(invoice) {
    return $.post(backendOriginUrl + '/invoice/' + invoice.id + '/access_tokens');
}

function initPayButton(invoice, payload) {
    var checkout = RbkmoneyCheckout.configure({
        invoiceID: invoice.id,
        invoiceAccessToken: payload,
        name: 'Some company',
        finished: function () {
            location.reload();
        }
    });
    $checkoutContainer.children('.product').append(invoice.product);
    $checkoutContainer.children('.description').append(invoice.description);
    $checkoutContainer.children('.amount').append(Number(invoice.amount) / 100).append(invoice.currency);
    $checkoutContainer.children('.live-demo-button').click(function () {
        checkout.open();
    });
}
