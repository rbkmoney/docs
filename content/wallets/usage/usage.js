const AuthInfo = (function () {
    function AuthInfo() {
        this.profileName = '';
        this.email = '';
        this.token = '';
        this.authUrl = '';
        this.profile = '';
    }

    return AuthInfo;
})();

const AuthService = (function () {
    function AuthService() {
    }

    AuthService.init = function () {
        const _this = this;
        const auth = new Keycloak('keycloak.json');
        return new Promise(function (resolve, reject) {
            auth.init().success(function () {
                _this.authInstance = auth;
                resolve();
            }).error(function () {
                return reject();
            });
        });
    };
    AuthService.login = function () {
        this.authInstance.login();
    };
    AuthService.logout = function () {
        this.authInstance.logout();
    };
    AuthService.updateToken = function (minValidity) {
        return this.authInstance.updateToken(minValidity);
    };
    AuthService.getAccountInfo = function () {
        const result = new AuthInfo();
        if (this.authInstance) {
            this.authInstance.loadUserProfile();
            result.profileName = this.authInstance.tokenParsed.name;
            result.email = this.authInstance.tokenParsed.email;
            result.token = this.authInstance.token;
            result.authUrl = this.authInstance.authServerUrl;
            result.profile = this.authInstance.profile;
        }
        return result;
    };
    return AuthService;
})();

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}`;
}

function createIdentity() {
    const walletProviderId = 'test';
    const {token, profileName} = AuthService.getAccountInfo();
    return fetch('https://api.rbk.money/wallet/v0/identities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': guid(),
        },
        body: JSON.stringify({
            name: profileName,
            provider: walletProviderId,
            class: 'person',
            metadata: {
                lkDisplayName: 'Иванов Иван Иванович'
            }
        })
    }).then((res) =>
        res.status >= 200 && res.status <= 300
            ? res.json()
            : res.json()
                .then((ex) => Promise.reject(ex))
                .catch(() => Promise.reject(res)));
}

function createWallet(identityID) {
    const walletProviderId = 'test';
    const {token} = AuthService.getAccountInfo();
    return fetch('https://api.rbk.money/wallet/v0/wallets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': guid(),
        },
        body: JSON.stringify({
            name: 'Default wallet',
            identity: identityID,
            currency: 'RUB',
            metadata: {
                "client_locale": "RU_ru"
            }
        })
    }).then((res) =>
        res.status >= 200 && res.status <= 300
            ? res.json()
            : res.json()
                .then((ex) => Promise.reject(ex))
                .catch(() => Promise.reject(res)));
}

function createWalletGrant(walletID, amount, validUntil) {
    const walletProviderId = 'test';
    const {token} = AuthService.getAccountInfo();
    return fetch(`https://api.rbk.money/wallet/v0/wallets/${walletID}/grants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': guid(),
        },
        body: JSON.stringify({
            asset: {
                amount: amount,
                "currency": "RUB"
            },
            validUntil: validUntil
        })
    }).then((res) =>
        res.status >= 200 && res.status <= 300
            ? res.json()
            : res.json()
                .then((ex) => Promise.reject(ex))
                .catch(() => Promise.reject(res)));
}

function createDestinationGrant(destinationID, validUntil) {
    const walletProviderId = 'test';
    const {token} = AuthService.getAccountInfo();
    return fetch(`https://api.rbk.money/wallet/v0/destinations/${destinationID}/grants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Bearer ${token}`,
            'X-Request-ID': guid(),
        },
        body: JSON.stringify({
            validUntil: validUntil
        })
    }).then((res) =>
        res.status >= 200 && res.status <= 300
            ? res.json()
            : res.json()
                .then((ex) => Promise.reject(ex))
                .catch(() => Promise.reject(res)));
}

$(() => {
    AuthService.init().then(() => {
        let identityID;
        let destinationID;
        let walletID;
        let walletUtils;
        const authenticated = AuthService.authInstance.authenticated;

        var nowPlus1Y = new Date();
        nowPlus1Y.setDate(nowPlus1Y.getDate() + 365);

        if (authenticated) {
            walletUtils = new RbkmoneyWalletUtils(AuthService.getAccountInfo().token);

            walletUtils.onCancel = () =>
                console.log('Wallet utils UI is dismissed');
        }

        $('#login-user-button').click(() =>
            AuthService.login());

        const identityButton = $('#create-identity-button');
        $('#create-identity-button').click(() => {
            if (!authenticated) {
                AuthService.login();
                return;
            }

            identityButton.attr('disabled', true)
            createIdentity().then((response) => {
                identityButton.attr('disabled', false);
                identityID = response.id;
                console.log(JSON.stringify(response));
            });
        });

        const identityChallengeButton = $('#create-identity-challenge-button');
        identityChallengeButton.click(() => {
            if (!authenticated) {
                AuthService.login();
                return;
            }
            if (!identityID) {
                alert("Создайте личность!");
                return;
            }

            identityChallengeButton.attr('disabled', true);
            walletUtils.startIdentityChallenge({
                identityID: identityID
            });

            walletUtils.onCompleteIdentityChallenge = (e) =>
                console.log('onCompleteIdentityChallenge:', e);

            walletUtils.onCancelIdentityChallenge = (e) =>
                console.log('onCancelIdentityChallenge:', e);

            walletUtils.onFailIdentityChallenge = (e) =>
                console.log('onFailIdentityChallenge:', e);
        });

        $('#create-payout-button').click(() => {
            if (!authenticated) {
                AuthService.login();
                return;
            }
            if (!identityID) {
                alert('Пройдите идентификацию!');
            }
            walletUtils.createDestination({
                identityID: identityID,
                name: `Payout #${identityID}`
            });

            walletUtils.onCreateDestination = (e) => {
                destinationID = e.data.id;
                console.log('onCreateDestination:', e.data);
            }
        });

        const walletButton = $('#create-wallet-button');
        $('#create-wallet-button').click(() => {
            walletButton.attr('disabled', true);
            if (!authenticated) {
                AuthService.login();
                return;
            }
            if (!identityID) {
                alert('Пройдите идентификацию!');
                return;
            }

            createWallet(identityID).then((response) => {
                walletButton.attr('disabled', false);
                walletID = response.id;
                console.log(JSON.stringify(response));
            });
        });

        const walletGrantButton = $('#create-wallet-grant-button');
        $('#create-wallet-grant-button').click(() => {
            walletGrantButton.attr('disabled', true);
            if (!authenticated) {
                AuthService.login();
                return;
            }
            if (!identityID) {
                alert('Пройдите идентификацию!');
                return;
            }
            if (!walletID) {
                alert('Создайте кошелек!');
                return;
            }

            createWalletGrant(walletID, 100, nowPlus1Y.toISOString()).then((response) => {
                walletGrantButton.attr('disabled', false);
                console.log(JSON.stringify(response));
            });
        });

        const destinationGrantButton = $('#create-destination-grant-button');
        $('#create-destination-grant-button').click(() => {
            if (!authenticated) {
                AuthService.login();
                return;
            }
            if (!identityID) {
                alert('Пройдите идентификацию!');
                return;
            }
            if (!destinationID) {
                alert('Привяжите карту!');
                return;
            }

            destinationGrantButton.attr('disabled', true);
            createDestinationGrant(destinationID, nowPlus1Y.toISOString()).then((response) => {
                destinationGrantButton.attr('disabled', false);
                console.log(JSON.stringify(response));
            });
        });
    });
});
