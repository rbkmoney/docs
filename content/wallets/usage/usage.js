const AuthInfo = (function() {
    function AuthInfo() {
        this.profileName = '';
        this.email = '';
        this.token = '';
        this.authUrl = '';
        this.profile = '';
    }

    return AuthInfo;
})();

const AuthService = (function() {
    function AuthService() {}

    AuthService.init = function() {
        const _this = this;
        const auth = new Keycloak('keycloak.json');
        return new Promise(function(resolve, reject) {
            auth.init().success(function() {
                _this.authInstance = auth;
                resolve();
            }).error(function() {
                return reject();
            });
        });
    };
    AuthService.login = function() {
        this.authInstance.login();
    };
    AuthService.logout = function() {
        this.authInstance.logout();
    };
    AuthService.updateToken = function(minValidity) {
        return this.authInstance.updateToken(minValidity);
    };
    AuthService.getAccountInfo = function() {
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
    const apiEndpoint = 'https://api.rbk.money/wallet/v0/identities';
    const walletProviderId = 'test';

    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var data = JSON.parse(this.responseText);
            resolve(data);
        };
        xhr.onerror = reject;
        xhr.open('POST', apiEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + AuthService.getAccountInfo().token);
        xhr.setRequestHeader('X-Request-ID', guid());
        xhr.send(JSON.stringify({
            name: AuthService.getAccountInfo().profileName,
            provider: walletProviderId,
            class: 'person',
            metadata: {
                lkDisplayName: 'Иванов Иван Иванович'
            }
        }));
    });
}

$(() => {
    var identityID;

    AuthService.init().then(() => {
        $('#login-user-button').click(() => {
            AuthService.login();
        });
    });

    $('#start-identity-button').click(() => {
        if (!AuthService.authInstance.authenticated)
            AuthService.login();

        const walletUtils = new RbkmoneyWalletUtils(AuthService.getAccountInfo().token);
        createIdentity().then((response) => {
            identityID = response.id;
            walletUtils.startIdentityChallenge({
                identityID: response.id
            });
        });

        walletUtils.onCompleteIdentityChallenge = (e) => console.log('onCompleteIdentityChallenge:', e);
    });

    $('#create-payout-button').click(() => {
        if (!AuthService.authInstance.authenticated)
            AuthService.login();

        if (!identityID)
            alert("Пройдите идентификацию!");

        const walletUtils = new RbkmoneyWalletUtils(AuthService.getAccountInfo().token);
        walletUtils.createOutput({
            identityID: identityID,
            name: "Payout #" + identityID
        });

        walletUtils.onCreateOutput = (e) => console.log('onCreateOutput:', e.data);
    });
});