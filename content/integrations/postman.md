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
- Для этого импортируйте [коллекцию RBKmoney API](/postman/RBKmoney.postman_collection.json) и [переменные окружения](/postman/RBKmoney.postman_environment.json) в ваш экземпляр программы.

!!! note "Подсказка" 
	Удобнее всего скопировать ссылки на [коллекцию](/postman/RBKmoney.postman_collection.json) и [переменные окружения](/postman/RBKmoney.postman_environment.json) и импортировать их, вставив через меню _File->Import->Import From Link_

- импортируйте коллекцию:
<a href="../../postman/screenshots/postman-import-collection.png" data-lightbox="postman-import-collection" data-title="postman-import-collection.png"><img src="../../postman/screenshots/postman-import-collection.png"></a>

- импортируйте переменные окружения:
<a href="../../postman/screenshots/postman-import-env.png" data-lightbox="postman-import-env" data-title="postman-import-env.png"><img src="../../postman/screenshots/postman-import-env.png"></a>

- Выберите &#9881;_->Manage Environments->RBKmoney_:
<a href="../../postman/screenshots/postman-manage-env.png" data-lightbox="postman-manage-env" data-title="postman-manage-env.png"><img src="../../postman/screenshots/postman-manage-env.png"></a>

- замените значение **api_key** на ваш [API-ключ](https://dashboard.rbk.money/tokenization), а также **notifications_email** на адрес вашей почты, если хотите получать уведомления о платежах и инвойсах от платформы:
<a href="../../postman/screenshots/postman-paste-apikey.png" data-lightbox="postman-paste-apikey" data-title="postman-paste-apikey.png"><img src="../../postman/screenshots/postman-paste-apikey.png"></a>

- Другие значения ключей изменять не нужно, их значения Postman подставит автоматически при вызове соответствующих методов API.

- Выберите переменные окружения RBKmoney в меню выбора:
<a href="../../postman/screenshots/postman-choose-env.png" data-lightbox="postman-choose-env" data-title="postman-choose-env.png"><img src="../../postman/screenshots/postman-choose-env.png"></a>

- сделайте вызов любого метода RBKmoney API, например, createInvoice() чтобы создать в системе инвойс и получить его данные:
<a href="../../postman/screenshots/postman-api-call.png" data-lightbox="postman-api-call" data-title="postman-api-call.png"><img src="../../postman/screenshots/postman-api-call.png"></a>

- запустите _Runner_, выберите коллекцию _RBKmoney_, выберите окружение _RBKmoney_ и нажмите _Start Run_ для проведения вызовов всех методов API последовательно
<a href="../../postman/screenshots/postman-open-runner.png" data-lightbox="postman-open-runner" data-title="postman-open-runner.png"><img src="../../postman/screenshots/postman-open-runner.png"></a>

- в тестовом магазине вашего [личного кабинета](https://dashboard.rbk.money/analytics/TEST/finance) появится успешно оплаченный инвойс с описанием "Postman description"
<a href="../../postman/screenshots/postman-runner-done.png" data-lightbox="postman-runner-done" data-title="postman-runner-done.png"><img src="../../postman/screenshots/postman-runner-done.png"></a>