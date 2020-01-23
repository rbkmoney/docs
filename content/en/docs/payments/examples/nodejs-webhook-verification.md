## Пример кода для верификации вебхуков на nodejs

Нам нужно проверить подпись, присланную в заголовке `Content-Signature`. Код для проверки может выглядеть так:

```js
const crypto = require('crypto');

/**
 * функция принимает нераспарсенное тело запроса и заголовок Content-Signature
 */
function verififyWebhookSignature(rawBody, contentSignatureHeader): boolean {
    const digest = contentSignatureHeader.replace(/alg=(\S+);\sdigest=/, '');
    const verify = crypto.createVerify('SHA256');
    verify.update(rawBody);
    verify.end();
    return verify.verify(webhookPublicKey, deUrlSafe(digest), 'base64');
}

function deUrlSafe(base64UrlSafe) {
    return base64UrlSafe.replace(/_/g, '/').replace(/-/g, '+').replace(/,/g, '');
}
```

Пример использования этих функций с koa, koa-body и koa-router
```js
import Koa from 'koa';
import bodyParser from 'koa-body';
import Router from 'koa-router';

const router = new Router();

// код middleware для вебхука
router.post('/webhook', ctx => {
    const unparsed = Symbol.for('unparsedBody');
    const ok = verififyWebhookSignature(ctx.request.body[unparsed], ctx.request.headers['content-signature']);
    console.log({ ok });
    // дальше делаем что-нибудь с данными присланными в вебхуке
    ctx.status = 200;
});

app.use(router.routes());
app.use(router.allowedMethods());
```
