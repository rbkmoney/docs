<script>
    lightbox.option({
      'fadeDuration': 10,
      'imageFadeDuration': 10,
      'resizeDuration': 10,
      'wrapAround': true
    })
</script>

## Тестирование API с помощью Postman

- [Postman](https://www.getpostman.com/) предоставляет удобный GUI для работы с API подобными нашему и позволяет делать подстановку переменных из результатов выполненного запроса в последующие, что удобно при выполнении каскадных вызовов API.
- Для этого импортируйте [коллекцию RBK.money API](/docs/payments/postman/RBKmoney.postman_collection.json), [коллекцию RBK.money Wallets](/docs/payments/postman/RBKmoney.Wallets.postman_collection.json) и [переменные окружения](/docs/payments/postman/RBKmoney.postman_environment.json) в ваш экземпляр программы.

!!! note "Подсказка" 
	Удобнее всего скопировать ссылки на [коллекцию](/docs/payments/postman/RBKmoney.postman_collection.json) и [переменные окружения](/docs/payments/postman/RBKmoney.postman_environment.json) и импортировать их, вставив через меню _File->Import->Import From Link_

- импортируйте коллекцию:
<a href="../../payments/postman/screenshots/postman-import-collection.png" data-lightbox="postman-import-collection" data-title="postman-import-collection.png"><img src="../../payments/postman/screenshots/postman-import-collection.png"></a>

- импортируйте переменные окружения:
<a href="../../payments/postman/screenshots/postman-import-env.png" data-lightbox="postman-import-env" data-title="postman-import-env.png"><img src="../../payments/postman/screenshots/postman-import-env.png"></a>

- Выберите &#9881;_->Manage Environments->RBKmoney_:
<a href="../../payments/postman/screenshots/postman-manage-env.png" data-lightbox="postman-manage-env" data-title="postman-manage-env.png"><img src="../../payments/postman/screenshots/postman-manage-env.png"></a>

- замените значение **api_key** на ваш [API-ключ](https://dashboard.rbk.money/tokenization), а также **notifications_email** на адрес вашей почты, если хотите получать уведомления о платежах и инвойсах от платформы:
<a href="../../payments/postman/screenshots/postman-paste-apikey.png" data-lightbox="postman-paste-apikey" data-title="postman-paste-apikey.png"><img src="../../payments/postman/screenshots/postman-paste-apikey.png"></a>

- Другие значения ключей изменять не нужно, их значения Postman подставит автоматически при вызове соответствующих методов API.

- Выберите переменные окружения RBKmoney в меню выбора:
<a href="../../payments/postman/screenshots/postman-choose-env.png" data-lightbox="postman-choose-env" data-title="postman-choose-env.png"><img src="../../payments/postman/screenshots/postman-choose-env.png"></a>

- сделайте вызов любого метода RBKmoney API, например, createInvoice() чтобы создать в системе инвойс и получить его данные:
<a href="../../payments/postman/screenshots/postman-api-call.png" data-lightbox="postman-api-call" data-title="postman-api-call.png"><img src="../../payments/postman/screenshots/postman-api-call.png"></a>
