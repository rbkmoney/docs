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

$(() => {
    AuthService.init().then(() => {
        let identityID;
        let walletUtils;
        const authenticated = AuthService.authInstance.authenticated;

        if (authenticated) {
            walletUtils = new RbkmoneyWalletUtils(AuthService.getAccountInfo().token);

            walletUtils.onCancel = () =>
                console.log('Wallet utils UI is dismissed');
        }

        $('#login-user-button').click(() =>
            AuthService.login());

        const identityButton = $('#start-identity-button');
        identityButton.click(() => {
            if (!authenticated) {
                AuthService.login();
                return;
            }
            identityButton.attr('disabled', true);
            createIdentity().then((response) => {
                identityButton.attr('disabled', false);
                identityID = response.id;
                walletUtils.startIdentityChallenge({
                    identityID: response.id
                });
            }).catch((error) => {
                console.error('createIdentity failed', error);
                identityButton.attr('disabled', false);
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

            walletUtils.onCreateDestination = (e) =>
                console.log('onCreateDestination:', e.data);
        });
    });
});
