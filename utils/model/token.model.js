export class TokenModel {
    constructor() {
        this.emailForLogin = '';
    }
    setemailForLogin(emailForLogin) {
        this.emailForLogin = emailForLogin;
    }
    getemailForLogin() {
        return this.emailForLogin;
    }
}
