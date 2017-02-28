const $liveDemo = document.getElementById('live-demo');
if($liveDemo) {

    $liveDemo.innerHTML = `
        <div id="live-demo-container">
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

    const $container = document.getElementById('live-demo-container');
    const $loader = document.getElementById('fountainG');
    const publicKey = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUdEZzelc3NDB2NTQ1MThVUVg1MGNnczN1U2pCSXkxbDdGcDVyMHdmYzFrIn0.eyJqdGkiOiIyNTI3OTQyYS1kMGU4LTQzNTctYWJiMi03ZmE0NTIwZjBlYjAiLCJleHAiOjAsIm5iZiI6MCwiaWF0IjoxNDg3NjA5NzU2LCJpc3MiOiJodHRwczovL2F1dGgucmJrLm1vbmV5L2F1dGgvcmVhbG1zL2V4dGVybmFsIiwiYXVkIjoidG9rZW5pemVyIiwic3ViIjoiZjQyNzIzZDAtMjAyMi00YjY2LTlmOTItNDU0OTc2OWYxYTkyIiwidHlwIjoiT2ZmbGluZSIsImF6cCI6InRva2VuaXplciIsIm5vbmNlIjoiZDc0YTYzYzAtNzdkYi00MDdiLWEzNmUtMTJhODFiNTlkM2UxIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZmNiMjRmMjktNDdhYi00YTY2LWFmZGItNDVkNmUyNjdlOGE3IiwiY2xpZW50X3Nlc3Npb24iOiIyM2E3OGY4Ny0yMTY5LTQ0NzMtYTM2OC04OTk2ODU5NTk5YWYiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiXX0sInJlc291cmNlX2FjY2VzcyI6eyJjb21tb24tYXBpIjp7InJvbGVzIjpbInBheW1lbnRfdG9vbF90b2tlbnM6Y3JlYXRlIl19fX0.bxSimSu5JxTd0b3THPXzJIelYh_Nclep4dQEVUBB8cWLpEm7IKA2eG0ZR9JtKGX9HXN2UFDY9phNNgbZ5vjsaYEl5hb5y0joCWniJPkUYIyy-yA4wDwpde1c97ALr4ZF-iJA3NKKgYtVlesrj99YOedW2qDvn2jzGwHgXBUX1iRxKhn7oARDp71QGxHWn4pdqbYLO8uAJfmRakXbpjtqLrTvf4Bv-Rmr48eKFBAH6OJhDcThpqv5AHlrSwqpokTtRewxNzWLpvDL1NoxDmeU9AXV7fnTGgxKWtKEJ_Vdm1ru---CxrEHd_UvynmV8w502Wwe6_g0fclcs-DR36hcLg';
    const checkoutOriginUrl = 'https://checkout.rbk.money';
    const backendOriginUrl = 'https://live-demo-backend.rbkmoney.com';

    function loadingStart() {
        $container.style.display = 'none';
        $loader.style.display = 'block';
    }
    function loadingComplete() {
        $container.style.display = 'block';
        $loader.style.display = 'none';
    }

    function getDueDate() {
        const checkFormat = (input) => {
            let formatted = String(input);
            if(formatted.length < 2) {
                formatted = '0' + formatted;
            }
            return formatted;
        };

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);

        const year = dueDate.getFullYear();
        const month = checkFormat(dueDate.getMonth() + 1);
        const day = checkFormat(dueDate.getDate());
        const hours = checkFormat(dueDate.getHours());
        const minutes = checkFormat(dueDate.getMinutes());
        const seconds = checkFormat(dueDate.getSeconds());

        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + 'Z';
    }

    function initInvoice() {
        const invoiceArgs = {
            shopID: 1,
            amount: Number(document.getElementById('amount').value) * 100,
            currency: document.getElementById('currency').value,
            dueDate: getDueDate(),
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
        request.open('POST', `${backendOriginUrl}/invoice`, true);
        request.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        request.send(JSON.stringify(invoiceArgs));
    }

    function initPayButton(invoice) {
        const amountMajor = Number(invoice.amount) / 100;
        $container.innerHTML = `
            <div id="payment">
                <h2 class="order" data-title="ID запроса: ${invoice.id}">Сформирован запрос</h2>
                <div>Товар: ${invoice.product}</div>
                <div>Сумма к оплате: ${amountMajor} ${invoice.currency}</div>
            </div>
        `;

        const script = document.createElement('script');
        script.setAttribute('src', `${checkoutOriginUrl}/payframe/payframe.js`);
        script.setAttribute('class', 'rbkmoney-checkout');
        script.setAttribute('data-key', publicKey);
        script.setAttribute('data-invoice-id', invoice.id);
        script.setAttribute('data-order-id', '1');
        script.setAttribute('data-amount', String(amountMajor));
        script.setAttribute('data-currency', invoice.currency);
        script.setAttribute('data-endpoint-init', `${backendOriginUrl}/init`);
        script.setAttribute('data-endpoint-events', `${backendOriginUrl}/events`);
        script.setAttribute('data-endpoint-success', location.href);
        script.setAttribute('data-endpoint-success-method', 'GET');
        script.setAttribute('data-name', 'Company name');

        const $payment = document.getElementById('payment');
        $payment.appendChild(script);
    }
}

