const AuthInfo = (function() {
    function AuthInfo() {
        this.profileName = '';
        this.email = '';
        this.token = '';
        this.authUrl = '';
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
            result.profileName = this.authInstance.tokenParsed.name;
            result.email = this.authInstance.tokenParsed.email;
            result.token = this.authInstance.token;
            result.authUrl = this.authInstance.authServerUrl;
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
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var data = JSON.parse(this.responseText);
            resolve(data);
        };
        xhr.onerror = reject;
        xhr.open('POST', 'https://api.rbk.money/wallet/v0/identities', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + AuthService.getAccountInfo().token);
        xhr.setRequestHeader('X-Request-ID', guid());
        xhr.send(JSON.stringify({
            name: 'Иванов Иван Иванович',
            provider: 'test',
            class: 'person',
            metadata: {
                lkDisplayName: 'Иванов Иван Иванович'
            }
        }));
    });
}

$(() => {
    AuthService.init().then(() => {
        $('#login-user-button').click(() => {
            AuthService.login();
        });
    });
});


$('#start-identity-button').click(() => {
    console.log(AuthService.getAccountInfo().token);
    const walletUtils = new RbkmoneyWalletUtils(AuthService.getAccountInfo().token);
    createIdentity().then((response) => {
        console.log(response.id);
        walletUtils.startIdentityChallenge({
            identityID: response.id
        });
    });
});