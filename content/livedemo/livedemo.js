const $liveDemo = document.getElementById('live-demo');
if($liveDemo) {

    $liveDemo.innerHTML =
        '<div id="live-demo-container">' +
            '<form action="javascript:initInvoice();">' +
                '<h2>Конфигурация товара</h2>' +
                '<label class="form-row">' +
                    'Наименование' +
                    '<input type="text" id="product" value="Резиновая уточка" />' +
                '</label>' +
                '<label class="form-row">' +
                    'Описание' +
                    '<input type="text" id="description" value="Очень нужная вещь" />' +
                '</label>' +
                '<label class="form-row">' +
                    'Стоимость' +
                    '<input type="number" id="amount" min="1" max="40000" value="1499" />' +
                '</label>' +
                '<input type="submit" value="Создать Invoice в системе" />' +
            '</form>' +
        '</div>' +
        '<div id="fountainG" style="display: none">' +
            '<div id="fountainG_1" class="fountainG"></div>' +
            '<div id="fountainG_2" class="fountainG"></div>' +
            '<div id="fountainG_3" class="fountainG"></div>' +
            '<div id="fountainG_4" class="fountainG"></div>' +
            '<div id="fountainG_5" class="fountainG"></div>' +
            '<div id="fountainG_6" class="fountainG"></div>' +
            '<div id="fountainG_7" class="fountainG"></div>' +
            '<div id="fountainG_8" class="fountainG"></div>' +
        '</div>';

    var $container = document.getElementById('live-demo-container');
    var $loader = document.getElementById('fountainG');
    var backendOriginUrl = 'https://live-demo-backend.rbkmoney.com';

    function loadingStart() {
        $container.style.display = 'none';
        $loader.style.display = 'block';
    }
    function loadingComplete() {
        $container.style.display = 'block';
        $loader.style.display = 'none';
    }

    function initInvoice() {
        var invoiceArgs = {
            shopID: 1,
            amount: Number(document.getElementById('amount').value) * 100,
            currency: 'RUB',
            dueDate: moment().add(1, 'days').utc().format(),
            product: document.getElementById('product').value,
            description: document.getElementById('description').value,
            metadata: {}
        };

        if(!invoiceArgs.amount || !invoiceArgs.currency || !invoiceArgs.product || !invoiceArgs.description) {
            return false;
        }

        loadingStart();
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                loadingComplete();
                if(request.status >= 200 && request.status < 300) {
                    var invoice = JSON.parse(request.responseText);
                    createAccessToken(invoice);
                }
            }
        };
        request.open('POST', backendOriginUrl + '/invoice/create', true);
        request.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        request.send(JSON.stringify(invoiceArgs));
    }

    function createAccessToken(invoice) {
        loadingStart();
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                loadingComplete();
                if(request.status >= 200 && request.status < 300) {
                    var accessToken = JSON.parse(request.responseText);
                    initPayButton(invoice, accessToken.payload);
                }
            }
        };
        request.open('POST', backendOriginUrl + '/invoice/' + invoice.id + '/access_tokens', true);
        request.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        request.send();
    }

    var checkout;
    function openCheckout() {
        if(checkout) {
            checkout.open();
        }
    }

    function initPayButton(invoice, payload) {
        var amountMajor = Number(invoice.amount) / 100;
        $container.innerHTML =
            '<div id="payment">' +
                '<h2 class="order" data-title="ID запроса: ' + invoice.id + '">Сформирован запрос</h2>' +
                '<div>Товар: ' + invoice.product + '</div>' +
                '<div>Сумма к оплате: ' + amountMajor + ' ' + invoice.currency + '</div>' +
                '<button class="checkout-button" onclick="openCheckout()">Оплатить</button>' +
            '</div>';

        checkout = RbkmoneyCheckout.configure({
            invoiceID: invoice.id,
            invoiceAccessToken: payload,
            name: 'Some company',
            finished: function() {
                location.replace(location.href);
            }
        });
    }
}
