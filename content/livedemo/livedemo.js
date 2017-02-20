const $tryNow = document.getElementById('try-now');
if($tryNow) {

    $tryNow.innerHTML = `
        <div id="try-now-container">
            <form action='javascript:initInvoice();'>
                <h2>Конфигурация товара</h2>
                <label class='form-row'>
                    Наименование
                    <input type='text' id='product' value='Резиновая уточка' />
                </label>
                <label class='form-row'>
                    Описание
                    <input type='text' id='description' value='Очень нужная вещь' />
                </label>
                <label class='form-row'>
                    Стоимость
                    <input type='number' id='amount' min='1' max='40000' value='1499' />
                    <select id='currency'>
                        <option value='RUB'>RUB</option>
                    </select>
                </label>
                <input type='submit' value='Создать Invoice в системе' />
            </form>
        </div>
        <div id="fountainG" style="display: none">
            <div id="fountainG_1" class="fountainG"></div>
            <div id="fountainG_2" class="fountainG"></div>
            <div id="fountainG_3" class="fountainG"></div>
            <div id="fountainG_4" class="fountainG"></div>
            <div id="fountainG_5" class="fountainG"></div>
            <div id="fountainG_6" class="fountainG"></div>
            <div id="fountainG_7" class="fountainG"></div>
            <div id="fountainG_8" class="fountainG"></div>
        </div>
    `;

    const $container = document.getElementById('try-now-container');
    const $loader = document.getElementById('fountainG');
    const publicKey = '';
    const hostCheckout = 'http://checkout.rbk.money:8080';
    const hostBackend = 'http://localhost:8001';

    function loadingStart() {
        $container.style.display = 'none';
        $loader.style.display = 'block';
    }
    function loadingComplete() {
        $container.style.display = 'block';
        $loader.style.display = 'none';
    }

    function getDueDate(date) {
        const checkFormat = (input) => {
            let formatted = String(input);
            if(formatted.length < 2) {
                formatted = '0' + formatted;
            }
            return formatted;
        };

        const year = date.getFullYear();
        const month = checkFormat(date.getMonth() + 1);
        const day = checkFormat(date.getDate() + 1);
        const hours = checkFormat(date.getHours());
        const minutes = checkFormat(date.getMinutes());
        const seconds = checkFormat(date.getSeconds());

        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + 'Z';
    }

    function initInvoice() {
        const invoiceArgs = {
            shopID: 1,
            amount: Number(document.getElementById('amount').value) * 100,
            currency: document.getElementById('currency').value,
            dueDate: getDueDate(new Date()),
            product: document.getElementById('product').value,
            description: document.getElementById('description').value,
            metadata: {}
        };

        if(!invoiceArgs.amount || !invoiceArgs.currency || !invoiceArgs.product || !invoiceArgs.description) {
            return false;
        }

        loadingStart();
        const request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                loadingComplete();
                if(request.status >= 200 && request.status < 300) {
                    initPayButton(JSON.parse(request.responseText));
                }
            }
        };
        request.open('POST', `${hostCheckout}/invoice`, true);
        request.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        request.send(JSON.stringify(invoiceArgs));
    }

    function initPayButton(invoice) {
        const amountMajor = Number(invoice.amount) / 100;
        $container.innerHTML = `
            <div id="payment">
                <h2>Сформирован заказ</h2>
                <div>Товар: ${invoice.product}</div>
                <div>Сумма к оплате: ${amountMajor} ${invoice.currency}</div>
            </div>
        `;

        const script = document.createElement('script');
        script.setAttribute('src', `${hostCheckout}/payframe/payframe.js`);
        script.setAttribute('class', 'rbkmoney-checkout');
        script.setAttribute('data-key', publicKey);
        script.setAttribute('data-invoice-id', invoice.id);
        script.setAttribute('data-order-id', '1');
        script.setAttribute('data-amount', String(amountMajor));
        script.setAttribute('data-currency', invoice.currency);
        script.setAttribute('data-endpoint-init', `${hostBackend}/init`);
        script.setAttribute('data-endpoint-events', `${hostBackend}/events`);
        script.setAttribute('data-endpoint-success', '/');
        script.setAttribute('data-endpoint-success-method', 'GET');
        script.setAttribute('data-name', 'Company name');

        const $payment = document.getElementById('payment');
        $payment.appendChild(script);
    }
}

