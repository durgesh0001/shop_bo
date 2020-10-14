var CryptoJS = require('crypto-js');
var vEnv = require('../../config/server_config/mode.json')['mode'];
var config = require('../../config/server_config/config.json')[vEnv];
var Crypto = require('crypto');

export class EncryptionService {
    constructor() {
    }
    getEncrypted(pWords) {
        if (!config.encryption)
            return pWords;
        return CryptoJS.AES.encrypt(pWords, config.encryption_key).toString();
    }

    getEncryptedPassword(pWords) {
        var md5Data = Crypto.createHash('md5').update(pWords).digest("hex");
        console.log("md5data",md5Data);
        return  md5Data;
    }

    getDecrypted(pWords) {
        if (!config.encryption)
            return pWords;
        return CryptoJS.AES.decrypt(pWords, config.encryption_key).toString(CryptoJS.enc.Utf8);
    }
}
