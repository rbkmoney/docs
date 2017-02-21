- Для проведения платежей в тестовом магазине используются специальные номера карт, которые определяют ответ платформы в зависимости от отправленной информации
- Для тестовых карт принимаются любые суммы пополнения, любые значения CVC-кода и любой срок действия карты, если он находится в будущем

## Таблица тестовых карт

| Action                 | Payment System | Card PAN                 |
|:----------------------:|:--------------:|:------------------------:|
| Success				 | Visa			  | 4242424242424242		 |
| 	    				 | MasterCard	  | 5555555555554444		 |
| 		        		 | Maestro		  | 586824160825533338		 |
| 3-D Secure Success     | Visa           | 4012888888881881         |
|                        | MasterCard     | 5169147129584558         |
| 3-D Secure Failure     | Visa           | 4987654321098769         |
|                        | MasterCard     | 5123456789012346         |
| 3-D Secure Timeout     | Visa           | 4342561111111118         |
|                        | MasterCard     | 5112000200000002         |
| Insufficient Funds     | Visa           | 4000000000000002         |
|                        | MasterCard     | 5100000000000412         |
| Invalid Card           | Visa           | 4222222222222220         |
|                        | MasterCard     | 5100000000000511         |
| CVV Match Fail         | Visa           | 4003830171874018         |
|                        | MasterCard     | 5496198584584769         |
| Expired Card           | Visa           | 4000000000000069         |
|                        | MasterCard     | 5105105105105100         |
| Unknown Failure        | Visa           | 4111110000000112         |
|                        | MasterCard     | 5124990000000002         |