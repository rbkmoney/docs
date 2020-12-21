# Пример функционирования Machinegun

Пример функционирования сервиса `Machinegun` описан по шагам в связке с сервисами [`Bender`](../Bender/bender_readme.md).    

1. От `capi` в [сервис `bender`](https://github.com/rbkmoney/bender-proto/blob/0d5813b8a25c8d03e4e59e42aa5f4e9b785a3849/proto%2Fbender.thrift#L47-L53) приходит запрос для создания нового уникального id на основе внешнего идентификатора `external-id`.
2. `bender` обращается в [`machinegun`](https://github.com/rbkmoney/machinegun_proto/blob/eac772bb8446fcd2f439232bf10fa086c336aca6/proto%2Fstate_processing.thrift#L416) для запуска автомата, который будет управлять хранением связки `external-id` -> `id`.
3. `machinegun` обращается в [специальный интерфейс `bender`](https://github.com/rbkmoney/machinegun_proto/blob/eac772bb8446fcd2f439232bf10fa086c336aca6/proto%2Fstate_processing.thrift#L322) для обработки специфической логики, связанной с хранением пары идентификаторов.
4. `bender` отвечает `machinegun`, что создание такого автомата допустимо, и что более ничего делать с этим автоматом не нужно.
5. `machinegun` отвечает `bender`, что автомат был создан успешно.
6. `bender` возвращает `capi` получившийся идентификатор.
