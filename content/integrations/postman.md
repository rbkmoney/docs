## Тестирование API с помощью Postman

- [Postman](https://www.getpostman.com/) предоставляет удобный GUI для работы с API подобными нашему и позволяет делать подстановку переменных из результатов выполненного запроса в последующие, что удобно при выполнении каскадных вызовов API.
- Для этого импортируйте [коллекцию RBKmoney API](/postman/RBKmoney.postman_collection.json) и [переменные окружения](/postman/RBKmoney.postman_environment.json) в ваш экземпляр программы.

!!! note "Подсказка" 
	Удобнее всего скопировать ссылки на [коллекцию](/postman/RBKmoney.postman_collection.json) и [переменные окружения](/postman/RBKmoney.postman_environment.json) и импортировать их, вставив через меню _File->Import->Import From Link_

- Выберите &#9881;_->Manage Environments->RBKmoney_ и замените значение **api_key** на ваш [API-ключ](https://dashboard.rbk.money/tokenization), а также **notifications_email** на адрес вашей почты, если хотите получать уведомления о платежах и инвойсах от платформы.
- Другие значения ключей изменять не нужно, их значения Postman подставит автоматически при вызове соответствующих методов API.
- Запустите _Runner_, выберите коллекцию _RBKmoney_, выберите окружение _RBKmoney_ и нажмите _Start Run_ для проведения вызовов всех методов API последовательно. В тестовом магазине вашего [личного кабинета](https://dashboard.rbk.money/analytics/1/finance) появится успешно оплаченный инвойс с описанием "Postman description".